'use client';

import { create } from 'zustand';
import type { NodeDef, EdgeDef, GraphState, PortDef } from '@/lib/types';

/*--------------------------------- graphStore.ts --------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/stores/graphStore.ts                                               |
| Descr:  The graph store contains record of all elements currently in the graph.  |
|   It is backend-synced and is only mutated by _apply functions called by the     |
|   dispatcher (not the UI directly) to maintain cononical state. The only         |
|   exception is the _hydrateGraph function which pulls current state from the     |
|   backend on load. Nothing is stored here that doesn't matter to the backend     |
|   (eg. position, selection, etc).                                                |
\*--------------------------------------------------------------------------------*/

interface GraphStore extends GraphState {
	// Internal apply methods called by dispatch and the sync layer for remote ops (changes made on the backend)
	_applyAddNode: (node: NodeDef) => void;
	_applyRemoveNode: (id: string) => void;
	_applyUpdateConfig: (id: string, patch: Record<string, string>) => void;
	_applyAddEdge: (edge: EdgeDef) => void;
	_applyRemoveEdge: (id: string) => void;
	_applyUpdateInputValue: (id: string, port: string, value: string) => void;
	_applyUpdateOutputs: (id: string, outputs: PortDef[]) => void;
	// Hydrate called from useGraphSync when websocket sends a hydrate message
	_hydrateGraph: (graph: { nodes: Record<string, NodeDef>; edges: Record<string, EdgeDef> }) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
	nodes: {},
	edges: {},
	version: 0, // In order to keep track of whether the graph has been updated

	_applyAddNode: (node) =>
		set((s) => ({
			nodes: { ...s.nodes, [node.id]: node }, // add id:node to nodes object
			version: s.version + 1,					// increment version
		})),

	_applyRemoveNode: (id) =>
		set((s) => {
			const nodes = { ...s.nodes };
			delete nodes[id];						// remove id:node from nodes object

			// remove edges connected to this node
			const edges = Object.fromEntries(
				Object.entries(s.edges).filter(([, e]) => e.src !== id && e.dst !== id)
			);
			// return and increment version
			return { nodes, edges, version: s.version + 1 };
		}),

	_applyUpdateConfig: (id, patch) =>
		set((s) => {
			if (!s.nodes[id]) return s;
			return {
				nodes: {
					...s.nodes,						// update id:node[config]
					[id]: { ...s.nodes[id], config: { ...s.nodes[id].config, ...patch } },
				},
				version: s.version + 1,				// increment version
			};
		}),

	_applyAddEdge: (edge) =>
		set((s) => ({
			edges: { ...s.edges, [edge.id]: edge },	// add id:edge to edges object
			version: s.version + 1,					// increment version
		})),

	_applyRemoveEdge: (id) =>
		set((s) => {
			const edges = { ...s.edges };
			delete edges[id];						// remove id:edge from edges object
			return { edges, version: s.version + 1 };	// return and increment version
		}),

	_applyUpdateInputValue: (id, port, value) =>
		set((s) => {
			if (!s.nodes[id]) return s;
			return {
				nodes: {
					...s.nodes,
					[id]: {
						...s.nodes[id],				// update id:node[inputValues]
						inputValues: { ...s.nodes[id].inputValues, [port]: value },
					},
				},
				version: s.version + 1,				// increment version
			};
		}),

	_applyUpdateOutputs: (id, outputs) =>
		set((s) => {
			if (!s.nodes[id]) return s;
			// Remove any edges connected to deleted output ports
			const outputNames = new Set(outputs.map((p) => p.name));	// make set of new output ports
			const edges = Object.fromEntries(
				Object.entries(s.edges).filter(([, e]) =>
					e.src !== id || outputNames.has(e.srcPort)			// keep only edges connected to ports in the current set
				)
			);
			return {													// update id:node to have new outputs
				nodes: { ...s.nodes, [id]: { ...s.nodes[id], outputs } },
				edges,
				version: s.version + 1,									// increment version
			};
		}),


	_hydrateGraph: ({ nodes, edges }) =>
		set({ nodes, edges, version: 0 }),		// overwrite nodes and edges and reset version to 0
}));

// TODO: still gotta add updateInputValue (append after existing methods in the create() call)
// useGraphStore.getState()._applyUpdateInputValue(id, port, value)