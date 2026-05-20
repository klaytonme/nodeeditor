'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GraphOp, SyncLayer } from '@/lib/types';
import { useGraphStore } from '@/lib/stores/graphStore';
import { useLogStore } from '@/lib/stores/logStore';
import { pendingOps } from './pendingOps';

// ─────────────────────────────────────────────────────────────────────────────
// useGraphSync — real WebSocket sync layer.
//
// Usage (in App.tsx or a context provider):
//   const sync = useGraphSync('graph-001');
//   // pass `sync` into dispatch via context or module-level setter
//
// Backend message protocol:
//   Client → Server:  { txId: string, op: GraphOp }
//   Server → Client:
//     | { type: 'ACK',    txId: string }
//     | { type: 'NACK',   txId: string, reason: string }
//     | { type: 'REMOTE', op: GraphOp }           ← another user's change
//     | { type: 'HYDRATE', nodes: ..., edges: ... } ← full state on connect
// ─────────────────────────────────────────────────────────────────────────────

let _txCounter = 0;
const makeTxId = () => `tx-${(++_txCounter).toString(36).padStart(4, '0')}`;

export function useGraphSync(graphId: string): SyncLayer {
	const ws = useRef<WebSocket | null>(null);
	const { log } = useLogStore.getState();
	const {
		_applyAddNode,
		_applyRemoveNode,
		_applyUpdateConfig,
		_applyAddEdge,
		_applyRemoveEdge,
		_hydrateGraph,
	} = useGraphStore.getState();

	// Apply a REMOTE op (already committed on backend — no txId, no rollback)
	const applyRemoteOp = useCallback((op: GraphOp) => {
		switch (op.type) {
			case 'ADD_NODE': _applyAddNode(op.node); break;
			case 'REMOVE_NODE': _applyRemoveNode(op.id); break;
			case 'UPDATE_CONFIG': _applyUpdateConfig(op.id, op.patch); break;
			case 'ADD_EDGE': _applyAddEdge(op.edge); break;
			case 'REMOVE_EDGE': _applyRemoveEdge(op.id); break;
		}
	}, []);

	useEffect(() => {
		const url = `${process.env.NEXT_PUBLIC_WS_URL ?? 'wss://localhost:4000'}/graphs/${graphId}`;
		log('ws', `Connecting to ${url}`);

		const socket = new WebSocket(url);
		ws.current = socket;

		socket.onopen = () => {
			log('ws', `Connected to graph ${graphId}`);
		};

		socket.onmessage = ({ data }) => {
			let msg: any;
			try { msg = JSON.parse(data); } catch { return; }

			switch (msg.type) {
				case 'ACK':
					log('ack', `✓ ACK ${msg.txId}`);
					pendingOps.confirm(msg.txId);
					break;

				case 'NACK':
					log('err', `✗ NACK ${msg.txId} — ${msg.reason ?? 'rejected'}`);
					pendingOps.rollback(msg.txId);
					break;

				case 'REMOTE':
					log('info', `↓ REMOTE ${msg.op.type}`);
					applyRemoteOp(msg.op as GraphOp);
					break;

				case 'HYDRATE':
					log('ws', `Hydrating graph from server (${Object.keys(msg.nodes).length} nodes)`);
					_hydrateGraph({ nodes: msg.nodes, edges: msg.edges });
					break;
			}
		};

		socket.onerror = () => {
			log('err', 'WebSocket error');
		};

		socket.onclose = ({ code, reason }) => {
			log('ws', `Disconnected (${code}${reason ? ': ' + reason : ''})`);
			// TODO: implement exponential backoff reconnect here
		};

		return () => {
			socket.close();
		};
	}, [graphId]);

	const sendOp = useCallback((op: GraphOp): string => {
		const txId = makeTxId();
		if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
			log('err', `Cannot send ${op.type} — socket not open`);
			return txId;
		}
		log('op', `→ OP ${op.type} [${txId}]`);
		ws.current.send(JSON.stringify({ txId, op }));
		return txId;
	}, []);

	return {
		sendOp,
		// Expose status reactively via a separate hook (useWsStatus) if needed
		status: 'connected',
	};
}
