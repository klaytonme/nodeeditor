import type { NodeDef, NodeType, DataType } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Default templates for each node type.
// Used by the toolbar buttons and palette to stamp out new nodes.
// Override label/config after calling dispatch.addNode().
// ─────────────────────────────────────────────────────────────────────────────

export const NODE_TEMPLATES: Record<NodeType, Omit<NodeDef, 'id'>> = {
	source: {
		type: 'source',
		label: 'HTTP Source',
		inputValues: { url: '/api/stream', trigger: '' },
		inputs: [
			{ name: 'url', label: 'url', type: 'str', isArray: false, defaultValue: '/api/stream' },
			{ name: 'trigger', label: 'trigger', type: 'pulse', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'data', label: 'data', type: 'obj', isArray: false },
			{ name: 'meta', label: 'meta', type: 'obj', isArray: false },
			{ name: 'status', label: 'status', type: 'int', isArray: false },
		],
		config: { method: 'GET', interval: '1s' },
	},
	transform: {
		type: 'transform',
		label: 'Map',
		inputValues: { in: '' },
		inputs: [
			{ name: 'in', label: 'in', type: 'obj', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'out', label: 'out', type: 'obj', isArray: false },
			{ name: 'keys', label: 'keys', type: 'str', isArray: true },
		],
		config: { fn: 'x => x', field: 'value' },
	},
	filter: {
		type: 'filter',
		label: 'Filter',
		inputValues: { in: '', threshold: '0' },
		inputs: [
			{ name: 'in', label: 'in', type: 'obj', isArray: false, defaultValue: '' },
			{ name: 'threshold', label: 'threshold', type: 'float', isArray: false, defaultValue: '0' },
		],
		outputs: [
			{ name: 'pass', label: 'pass', type: 'obj', isArray: false },
			{ name: 'reject', label: 'reject', type: 'obj', isArray: false },
		],
		config: { condition: 'x > 0', field: 'value' },
	},
	aggregate: {
		type: 'aggregate',
		label: 'Window Agg',
		inputValues: { in: '', window: '5s' },
		inputs: [
			{ name: 'in', label: 'in', type: 'float', isArray: true, defaultValue: '' },
			{ name: 'window', label: 'window', type: 'str', isArray: false, defaultValue: '5s' },
		],
		outputs: [
			{ name: 'out', label: 'out', type: 'float', isArray: false },
			{ name: 'count', label: 'count', type: 'int', isArray: false },
		],
		config: { fn: 'sum' },
	},
	sink: {
		type: 'sink',
		label: 'DB Sink',
		inputValues: { data: '', key: '' },
		inputs: [
			{ name: 'data', label: 'data', type: 'obj', isArray: false, defaultValue: '' },
			{ name: 'key', label: 'key', type: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [],
		config: { table: 'events', batch: '100' },
	},
};


export const DATA_TYPE_COLOR: Record<DataType, string> = {
	str: '#00daa0',   // teal
	int: '#fb9907',    // orange
	float: '#ee3c0f',    // red-orange
	date: '#d3a4d9',    // lavender
	obj: '#50bfe1',    // blue
	bool: '#a78bfa',    // purple
	pulse: '#facc15',    // yellow
	encrypted: '#c5c5c5',    // grey
	unknown: '#6b7280',    // muted
};


// Colour tokens per node type — used by nodes, ports, inspector tags, palette dots
export const NODE_TYPE_HEADER_COLOR: Record<NodeType, string> = {
	source: 'rgb(0, 116, 93)',
	transform: 'rgb(142, 41, 74)',
	filter: 'rgb(146, 100, 0)',
	aggregate: 'rgb(60, 60, 160)',
	sink: 'rgb(80, 30, 30)',
};


export const NODE_WIDTH = 180;   // px
export const PORT_SIZE = 10;
export const PORT_RADIUS = 6;    // px
export const EDGE_BEZIER_TENSION = 0.5; // control point pull factor
export const EDGE_BEZIER_OFFSET = 30;

// Timeout (ms) before an unacknowledged op is auto-rolled-back
export const OP_TIMEOUT_MS = 5000;

// Debounce (ms) for position-change ops — positions are lower priority
export const POSITION_DEBOUNCE_MS = 300;