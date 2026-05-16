'use client';

import { create } from 'zustand';
import type { NodeDef, EdgeDef, GraphState } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// graphStore — canonical, backend-synced state.
//
// Rules:
//   • Only mutated via _apply* methods (called by dispatch, not by UI directly)
//   • _apply* methods are also called for REMOTE ops arriving from the backend
//   • Never store UI concerns here (positions, selection, hover, drag state)
// ─────────────────────────────────────────────────────────────────────────────

interface GraphStore extends GraphState {
	// Internal apply methods — called by dispatch and by the sync layer for remote ops
	_applyAddNode: (node: NodeDef) => void;
	_applyRemoveNode: (id: string) => void;
	_applyUpdateConfig: (id: string, patch: Record<string, string>) => void;
	_applyAddEdge: (edge: EdgeDef) => void;
	_applyRemoveEdge: (id: string) => void;

	// Full graph replace — use when hydrating from backend on connect
	_applyUpdateInputValue: (id: string, port: string, value: string) => void;
	_hydrateGraph: (graph: { nodes: Record<string, NodeDef>; edges: Record<string, EdgeDef> }) => void;
}

export const useGraphStore = create<GraphStore>((set, get) => ({
	nodes: {},
	edges: {},
	version: 0,

	_applyAddNode: (node) =>
		set((s) => ({
			nodes: { ...s.nodes, [node.id]: node },
			version: s.version + 1,
		})),

	_applyRemoveNode: (id) =>
		set((s) => {
			const nodes = { ...s.nodes };
			delete nodes[id];

			// Also remove any edges connected to this node
			const edges = Object.fromEntries(
				Object.entries(s.edges).filter(([, e]) => e.src !== id && e.dst !== id)
			);

			return { nodes, edges, version: s.version + 1 };
		}),

	_applyUpdateConfig: (id, patch) =>
		set((s) => {
			if (!s.nodes[id]) return s;
			return {
				nodes: {
					...s.nodes,
					[id]: { ...s.nodes[id], config: { ...s.nodes[id].config, ...patch } },
				},
				version: s.version + 1,
			};
		}),

	_applyAddEdge: (edge) =>
		set((s) => ({
			edges: { ...s.edges, [edge.id]: edge },
			version: s.version + 1,
		})),

	_applyRemoveEdge: (id) =>
		set((s) => {
			const edges = { ...s.edges };
			delete edges[id];
			return { edges, version: s.version + 1 };
		}),

	_applyUpdateInputValue: (id, port, value) =>
		set((s) => {
			if (!s.nodes[id]) return s;
			return {
				nodes: {
					...s.nodes,
					[id]: {
						...s.nodes[id],
						inputValues: { ...s.nodes[id].inputValues, [port]: value },
					},
				},
				version: s.version + 1,
			};
		}),

	_hydrateGraph: ({ nodes, edges }) =>
		set({ nodes, edges, version: 0 }),
}));

// Patch — add updateInputValue (append after existing methods in the create() call)
// NOTE: call useGraphStore.getState()._applyUpdateInputValue(id, port, value)