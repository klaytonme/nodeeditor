'use client';

import { dispatch } from '@/lib/sync/dispatch';
import { useUIStore } from '@/lib/stores/uiStore';
import { NODE_LIBRARY } from '@/lib/constants';

export function seedGraph() {
	const n1 = dispatch.addNode({ ...NODE_LIBRARY.http, label: 'Events API', category: 'source' });
	const n2 = dispatch.addNode({ ...NODE_LIBRARY.parse_obj, label: 'Parse Response' });
	const n3 = dispatch.addNode({ ...NODE_LIBRARY.compare, label: 'Score > 0.5' });
	const n4 = dispatch.addNode({ ...NODE_LIBRARY.filter, label: 'Gate' });
	const n5 = dispatch.addNode({ ...NODE_LIBRARY.db_write, label: 'Postgres' });

	const { setPosition } = useUIStore.getState();
	setPosition(n1.id, { x: 40, y: 80 });
	setPosition(n2.id, { x: 310, y: 60 });
	setPosition(n3.id, { x: 580, y: 40 });
	setPosition(n4.id, { x: 580, y: 240 });
	setPosition(n5.id, { x: 850, y: 150 });

	setTimeout(() => {
		dispatch.addEdge(n1.id, 'data', n2.id, 'in');
		dispatch.addEdge(n2.id, 'out', n3.id, 'a');
		dispatch.addEdge(n3.id, 'result', n4.id, 'condition');
		dispatch.addEdge(n4.id, 'pass', n5.id, 'data');
	}, 50);
}