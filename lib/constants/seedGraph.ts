'use client';

import { dispatch } from '@/lib/sync/dispatch';
import { useUIStore } from '@/lib/stores/uiStore';
import { NODE_TEMPLATES } from '@/lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
// seedGraph — creates the demo graph shown on first load.
// Call this once after the app mounts.
// Remove or replace with a backend HYDRATE fetch when going live.
// ─────────────────────────────────────────────────────────────────────────────

export function seedGraph() {
	const n1 = dispatch.addNode({ ...NODE_TEMPLATES.source, label: 'Events API' });
	const n2 = dispatch.addNode({ ...NODE_TEMPLATES.transform, label: 'Parse JSON' });
	const n3 = dispatch.addNode({ ...NODE_TEMPLATES.filter, label: 'Score > 0.5' });
	const n4 = dispatch.addNode({ ...NODE_TEMPLATES.aggregate, label: 'Sum Window' });
	const n5 = dispatch.addNode({ ...NODE_TEMPLATES.sink, label: 'Postgres' });

	const { setPosition } = useUIStore.getState();
	setPosition(n1.id, { x: 40, y: 80 });
	setPosition(n2.id, { x: 370, y: 60 });
	setPosition(n3.id, { x: 650, y: 80 });
	setPosition(n4.id, { x: 650, y: 240 });
	setPosition(n5.id, { x: 1000, y: 160 });

	// Edges need a tick so port refs are registered
	setTimeout(() => {
		dispatch.addEdge(n1.id, 'data', n2.id, 'in');
		dispatch.addEdge(n2.id, 'out', n3.id, 'in');
		dispatch.addEdge(n3.id, 'pass', n5.id, 'data');
		dispatch.addEdge(n3.id, 'reject', n4.id, 'in');
		dispatch.addEdge(n4.id, 'out', n5.id, 'data');
	}, 50);
}
