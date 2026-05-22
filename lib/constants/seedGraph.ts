'use client';

import { dispatch } from '@/lib/sync/dispatch';
import { useUIStore } from '@/lib/stores/uiStore';
import { NODE_LIBRARY } from '@/lib/constants';

/*--------------------------------- seedGraphs.ts --------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/constants/seedGraphs.ts                                            |
| Descr:  This file uses the proper disbatch commands to populate the graph with   |
|   the default nodes and edges. This simulates a user constructing the default    |
|   graph tree and would be replaced with a call to hydrate graph when loading in  |
|   from an actual backend.                                                        |
\*--------------------------------------------------------------------------------*/

export function seedGraph() {
	// Add all nodes
	const n1 = dispatch.addNode({ ...NODE_LIBRARY.timer, label: 'Pulse' });
	const n2 = dispatch.addNode({ ...NODE_LIBRARY.http, label: 'Test Data Source', category: 'source' });
	const n3 = dispatch.addNode({ ...NODE_LIBRARY.constant, label: "Constant" });
	const n4 = dispatch.addNode({ ...NODE_LIBRARY.parse_obj, label: 'Parse Response' });
	const n5 = dispatch.addNode({ ...NODE_LIBRARY.compare, label: 'Date Check' });
	const n6 = dispatch.addNode({ ...NODE_LIBRARY.filter, label: "Filter" });
	const n7 = dispatch.addNode({ ...NODE_LIBRARY.http, label: "Test Data Endpoint", category: 'sink' })

	// Update input values and output keys for parse object
	dispatch.updateInputValue(n1.id, "interval", "500");

	dispatch.updateInputValue(n2.id, "url", "test.data.net/poll")
	dispatch.updateInputValue(n2.id, "headers", "{auth:smth}");
	dispatch.updateInputValue(n2.id, 'interval', "");

	dispatch.updateInputValue(n3.id, "value", "Jan 15, 2025 00:30:00 PST");

	dispatch.updateOutputs(n4.id, [...n4.outputs, {
		name: "id",
		label: "id",
		dataType: "int",
		isArray: false,
		defaultValue: "",
		userDefined: true,
		listenedField: false,

	}, {
		name: "timestamp",
		label: "timestamp",
		dataType: "date",
		isArray: false,
		defaultValue: "",
		userDefined: true,
		listenedField: false,

	}, {
		name: "records",
		label: "records",
		dataType: "obj",
		isArray: true,
		defaultValue: "",
		userDefined: true,
		listenedField: false,

	}]);

	dispatch.updateInputValue(n5.id, "operator", ">=");

	dispatch.updateInputValue(n7.id, 'url', "endpoint.data.net/send");
	dispatch.updateInputValue(n7.id, 'method', "POST");
	dispatch.updateInputValue(n7.id, 'headers', "{auth:secondGo");
	dispatch.updateInputValue(n7.id, 'interval', "");



	// Set all positions
	const { setPosition } = useUIStore.getState();
	setPosition(n1.id, { x: 40, y: 300 });
	setPosition(n2.id, { x: 310, y: 40 });
	setPosition(n3.id, { x: 580, y: 40 });
	setPosition(n4.id, { x: 580, y: 200 });
	setPosition(n5.id, { x: 850, y: 80 });
	setPosition(n6.id, { x: 1120, y: 250 });
	setPosition(n7.id, { x: 580, y: 450 });

	// Construct edges
	setTimeout(() => {
		dispatch.addEdge(n1.id, 'tick', n2.id, 'trigger');
		dispatch.addEdge(n1.id, 'tick', n7.id, 'trigger');
		dispatch.addEdge(n2.id, 'data', n4.id, 'in');
		dispatch.addEdge(n3.id, 'value', n5.id, 'a');
		dispatch.addEdge(n4.id, 'id', n5.id, 'b');
		dispatch.addEdge(n4.id, 'records', n6.id, 'in');
		dispatch.addEdge(n5.id, 'result', n6.id, 'condition');
		dispatch.addEdge(n6.id, 'pass', n7.id, 'body');
	}, 50);
}