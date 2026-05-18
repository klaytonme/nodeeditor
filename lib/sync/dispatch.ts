'use client';

import { useGraphStore } from '@/lib/stores/graphStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { useLogStore } from '@/lib/stores/logStore';
import { pendingOps } from '@/lib/sync/pendingOps';
import { syncLayerStub } from '@/lib/sync/syncLayerStub';
import type { NodeDef, EdgeDef, GraphOp, SyncLayer, PortDef } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// dispatch — the ONLY way the UI should mutate graph state.
//
// Each action:
//   1. Applies the change optimistically to graphStore (instant UI update)
//   2. Sends the op to the sync layer (stub or real WebSocket)
//   3. Registers a rollback with pendingOps in case the backend rejects it
//
// To switch from stub → real backend:
//   Call dispatch.setSyncLayer(useGraphSync('graph-001'))
//   from your App component after the hook is set up.
// ─────────────────────────────────────────────────────────────────────────────

let _syncLayer: SyncLayer = syncLayerStub;

let _idCounter = 1;
const uid = () => `n${String(_idCounter++).padStart(3, '0')}`;
const eid = () => `e${String(_idCounter++).padStart(3, '0')}`;

function send(op: GraphOp, rollbackFn: () => void): string {
	const txId = _syncLayer.sendOp(op);
	pendingOps.register(txId, rollbackFn);
	return txId;
}

export const dispatch = {
	/** Swap in the real WebSocket sync layer (call once on app init) */
	setSyncLayer(layer: SyncLayer) {
		_syncLayer = layer;
	},

	addNode(partial: Omit<NodeDef, 'id'>): NodeDef {
		const node: NodeDef = { ...partial, id: uid() };
		const { _applyAddNode, _applyRemoveNode } = useGraphStore.getState();

		_applyAddNode(node);
		send({ type: 'ADD_NODE', node }, () => _applyRemoveNode(node.id));

		return node;
	},

	removeNode(id: string) {
		const { nodes, edges, _applyAddNode, _applyRemoveNode, _applyAddEdge } =
			useGraphStore.getState();
		const { removePosition } = useUIStore.getState();

		const node = nodes[id];
		if (!node) return;

		// Capture all edges that will be removed as a side-effect
		const affectedEdges = Object.values(edges).filter(
			(e) => e.src === id || e.dst === id
		);

		_applyRemoveNode(id);
		removePosition(id);

		send({ type: 'REMOVE_NODE', id }, () => {
			_applyAddNode(node);
			affectedEdges.forEach((e) => _applyAddEdge(e));
		});
	},

	updateConfig(id: string, patch: Record<string, string>) {
		const { nodes, _applyUpdateConfig } = useGraphStore.getState();
		const oldConfig = { ...nodes[id]?.config };

		_applyUpdateConfig(id, patch);
		send({ type: 'UPDATE_CONFIG', id, patch }, () =>
			_applyUpdateConfig(id, oldConfig)
		);
	},

	updateLabel(id: string, label: string) {
		const { nodes } = useGraphStore.getState();
		const node = nodes[id];
		if (!node) return;

		// Label isn't part of config so we write it directly and send a synthetic op.
		// Alternatively, promote label into config on your schema.
		useGraphStore.setState((s) => ({
			nodes: { ...s.nodes, [id]: { ...s.nodes[id], label } },
		}));

		const oldLabel = node.label;
		send(
			{ type: 'UPDATE_CONFIG', id, patch: { __label: label } },
			() => {
				useGraphStore.setState((s) => ({
					nodes: { ...s.nodes, [id]: { ...s.nodes[id], label: oldLabel } },
				}));
			}
		);
	},

	addEdge(
		src: string,
		srcPort: string,
		dst: string,
		dstPort: string
	): EdgeDef | null {
		const { edges, _applyAddEdge, _applyRemoveEdge } =
			useGraphStore.getState();

		// Prevent duplicate edges
		const duplicate = Object.values(edges).find(
			(e) =>
				e.src === src &&
				e.srcPort === srcPort &&
				e.dst === dst &&
				e.dstPort === dstPort
		);
		if (duplicate) return null;

		// Prevent self-loops
		if (src === dst) return null;

		const edge: EdgeDef = { id: eid(), src, srcPort, dst, dstPort };
		_applyAddEdge(edge);
		send({ type: 'ADD_EDGE', edge }, () => _applyRemoveEdge(edge.id));

		return edge;
	},

	removeEdge(id: string) {
		const { edges, _applyAddEdge, _applyRemoveEdge } =
			useGraphStore.getState();
		const edge = edges[id];
		if (!edge) return;

		_applyRemoveEdge(id);
		send({ type: 'REMOVE_EDGE', id }, () => _applyAddEdge(edge));
	},

	updateInputValue(id: string, port: string, value: string) {
		const { nodes, _applyUpdateInputValue } = useGraphStore.getState();
		const oldValue = nodes[id]?.inputValues?.[port] ?? '';
		_applyUpdateInputValue(id, port, value);
		send({ type: 'UPDATE_INPUT', id, port, value }, () =>
			_applyUpdateInputValue(id, port, oldValue)
		);
	},


	updateOutputs(id: string, outputs: PortDef[]) {
		const { nodes, _applyUpdateOutputs } = useGraphStore.getState();
		const oldOutputs = [...(nodes[id]?.outputs ?? [])];
		_applyUpdateOutputs(id, outputs);
		send(
			{ type: 'UPDATE_OUTPUTS', id, outputs },
			() => _applyUpdateOutputs(id, oldOutputs)
		);
	},


	clearGraph() {
		const { nodes } = useGraphStore.getState();
		const { log } = useLogStore.getState();
		Object.keys(nodes).forEach((id) => dispatch.removeNode(id));
		log('info', 'Graph cleared');
	},
};