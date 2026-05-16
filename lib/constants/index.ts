'use client';

import type { NodeDef, NodeType, DataType } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Node templates — each has fully typed ports with dataType and isArray
// ─────────────────────────────────────────────────────────────────────────────

export const NODE_TEMPLATES: Record<NodeType, Omit<NodeDef, 'id'>> = {
	source: {
		type: 'source',
		label: 'HTTP Source',
		inputs: [
			{ name: 'url', label: 'url', dataType: 'str', isArray: false },
			{ name: 'trigger', label: 'trigger', dataType: 'pulse', isArray: false },
		],
		outputs: [
			{ name: 'data', label: 'data', dataType: 'obj', isArray: false },
			{ name: 'meta', label: 'meta', dataType: 'obj', isArray: false },
			{ name: 'status', label: 'status', dataType: 'int', isArray: false },
		],
		config: { url: '/api/stream', method: 'GET', interval: '1s' },
	},
	transform: {
		type: 'transform',
		label: 'Map',
		inputs: [
			{ name: 'in', label: 'in', dataType: 'obj', isArray: false },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'obj', isArray: false },
			{ name: 'keys', label: 'keys', dataType: 'str', isArray: true },
		],
		config: { fn: 'x => x', field: 'value' },
	},
	filter: {
		type: 'filter',
		label: 'Filter',
		inputs: [
			{ name: 'in', label: 'in', dataType: 'obj', isArray: false },
			{ name: 'threshold', label: 'threshold', dataType: 'float', isArray: false },
		],
		outputs: [
			{ name: 'pass', label: 'pass', dataType: 'obj', isArray: false },
			{ name: 'reject', label: 'reject', dataType: 'obj', isArray: false },
		],
		config: { condition: 'x > 0', field: 'value' },
	},
	aggregate: {
		type: 'aggregate',
		label: 'Window Agg',
		inputs: [
			{ name: 'in', label: 'in', dataType: 'float', isArray: true },
			{ name: 'window', label: 'window', dataType: 'str', isArray: false },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'float', isArray: false },
			{ name: 'count', label: 'count', dataType: 'int', isArray: false },
		],
		config: { window: '5s', fn: 'sum' },
	},
	sink: {
		type: 'sink',
		label: 'DB Sink',
		inputs: [
			{ name: 'data', label: 'data', dataType: 'obj', isArray: false },
			{ name: 'key', label: 'key', dataType: 'str', isArray: false },
		],
		outputs: [],
		config: { table: 'events', batch: '100' },
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Port data type → colour (matching your original Cloudstream palette)
// ─────────────────────────────────────────────────────────────────────────────

export const DATA_TYPE_COLOR: Record<DataType, string> = {
	str: '#00da a0',   // teal
	int: '#fb9907',    // orange
	float: '#ee3c0f',    // red-orange
	date: '#d3a4d9',    // lavender
	obj: '#50bfe1',    // blue
	bool: '#a78bfa',    // purple
	pulse: '#facc15',    // yellow
	encrypted: '#c5c5c5',    // grey
	unknown: '#6b7280',    // muted
};

// Fix the str color (had a space in it above)
DATA_TYPE_COLOR['str'] = '#00daa0';

// Node type → header background colour
export const NODE_TYPE_HEADER_COLOR: Record<NodeType, string> = {
	source: 'rgb(0, 116, 93)',
	transform: 'rgb(142, 41, 74)',
	filter: 'rgb(146, 100, 0)',
	aggregate: 'rgb(60, 60, 160)',
	sink: 'rgb(80, 30, 30)',
};

export const NODE_TYPE_COLOR: Record<NodeType, string> = NODE_TYPE_HEADER_COLOR;

export const NODE_WIDTH = 240;        // px — wider to fit row labels
export const PORT_SIZE = 10;          // px — port indicator size
export const EDGE_BEZIER_TENSION = 0.5;
export const EDGE_BEZIER_OFFSET = 30;
export const OP_TIMEOUT_MS = 5000;
export const POSITION_DEBOUNCE_MS = 300;