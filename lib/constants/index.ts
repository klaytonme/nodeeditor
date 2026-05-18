'use client';

import type { NodeDef, NodeKind, NodeCategory, DataType } from '@/lib/types';

// ─────────────────────────────────────────────────────────────────────────────
// Node library — one template per NodeKind
// ─────────────────────────────────────────────────────────────────────────────

type NodeTemplate = Omit<NodeDef, 'id'>;

export const NODE_LIBRARY: Record<NodeKind, NodeTemplate> = {

	// ── SOURCES ────────────────────────────────────────────────────────────────

	constant: {
		kind: 'constant', category: 'source', label: 'Constant',
		inputValues: { value: '', type: 'str' },
		config: {},
		inputs: [
			{ name: 'value', label: 'value', dataType: 'any', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'value', label: 'value', dataType: 'any', isArray: false },
			{ name: 'type', label: 'type', dataType: 'str', isArray: false },
		],
	},

	http: {
		kind: 'http', category: 'source', label: 'HTTP',
		inputValues: { url: '', method: 'GET', headers: '{}', body: '{}', trigger: '' },
		config: { mode: 'on_trigger' }, // 'on_trigger' | 'poll'
		inputs: [
			{ name: 'trigger', label: 'trigger', dataType: 'pulse', isArray: false, defaultValue: '' },
			{ name: 'url', label: 'url', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'method', label: 'method', dataType: 'str', isArray: false, defaultValue: 'GET' },
			{ name: 'headers', label: 'headers', dataType: 'obj', isArray: false, defaultValue: '{}' },
			{ name: 'body', label: 'body', dataType: 'obj', isArray: false, defaultValue: '{}' },
			{
				name: 'interval', label: 'interval', dataType: 'str', isArray: false, defaultValue: '5s',
				activeWhen: { config: 'mode', value: 'poll' }
			},
		],
		outputs: [
			{ name: 'data', label: 'data', dataType: 'obj', isArray: false },
			{ name: 'status', label: 'status', dataType: 'int', isArray: false },
			{ name: 'headers', label: 'headers', dataType: 'obj', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	websocket: {
		kind: 'websocket', category: 'source', label: 'WebSocket',
		inputValues: { url: '', send: '{}' },
		config: {},
		inputs: [
			{ name: 'url', label: 'url', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'send', label: 'send', dataType: 'obj', isArray: false, defaultValue: '{}' },
		],
		outputs: [
			{ name: 'message', label: 'message', dataType: 'obj', isArray: false },
			{ name: 'status', label: 'status', dataType: 'str', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	timer: {
		kind: 'timer', category: 'source', label: 'Timer',
		inputValues: { interval: '500', enabled: 'true' },
		config: {},
		inputs: [
			{ name: 'interval', label: 'interval (ms)', dataType: 'int', isArray: false, defaultValue: '500' },
			{ name: 'enabled', label: 'enabled', dataType: 'bool', isArray: false, defaultValue: 'true' },
		],
		outputs: [
			{ name: 'tick', label: 'tick', dataType: 'pulse', isArray: false },
			{ name: 'count', label: 'count', dataType: 'int', isArray: false },
		],
	},

	csv: {
		kind: 'csv', category: 'source', label: 'CSV / File',
		inputValues: { path: '', trigger: '' },
		config: {},
		inputs: [
			{ name: 'trigger', label: 'trigger', dataType: 'pulse', isArray: false, defaultValue: '' },
			{ name: 'path', label: 'path', dataType: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'rows', label: 'rows', dataType: 'obj', isArray: true },
			{ name: 'headers', label: 'headers', dataType: 'str', isArray: true },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	// ── TRANSFORMS ─────────────────────────────────────────────────────────────

	parse_obj: {
		kind: 'parse_obj', category: 'transform', label: 'Parse Object',
		inputValues: { in: '', listen: 'false' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'obj', isArray: false, defaultValue: '' },
			{ name: 'listen', label: 'listen', dataType: 'bool', isArray: false, defaultValue: 'false' },
		],
		outputs: [
			// Outputs are dynamic when listen=true; these are the static defaults
			{ name: 'keys', label: 'keys', dataType: 'str', isArray: true },
		],
	},

	map: {
		kind: 'map', category: 'transform', label: 'Map',
		inputValues: { in: '', fn: 'x => x' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'any', isArray: false, defaultValue: '' },
			{ name: 'fn', label: 'fn', dataType: 'str', isArray: false, defaultValue: 'x => x' },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'any', isArray: false },
		],
	},

	filter: {
		kind: 'filter', category: 'transform', label: 'Filter',
		inputValues: { in: '', condition: 'false' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'any', isArray: false, defaultValue: '' },
			{ name: 'condition', label: 'condition', dataType: 'bool', isArray: false, defaultValue: 'false' },
		],
		outputs: [
			{ name: 'pass', label: 'pass', dataType: 'any', isArray: false },
			{ name: 'reject', label: 'reject', dataType: 'any', isArray: false },
		],
	},

	branch: {
		kind: 'branch', category: 'transform', label: 'Branch',
		inputValues: { in: '', condition: 'false' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'any', isArray: false, defaultValue: '' },
			{ name: 'condition', label: 'condition', dataType: 'bool', isArray: false, defaultValue: 'false' },
		],
		outputs: [
			{ name: 'true', label: 'true', dataType: 'any', isArray: false },
			{ name: 'false', label: 'false', dataType: 'any', isArray: false },
		],
	},

	compare: {
		kind: 'compare', category: 'transform', label: 'Compare',
		inputValues: { a: '0', b: '0', operator: '==' },
		config: {},
		inputs: [
			{ name: 'a', label: 'a', dataType: 'any', isArray: false, defaultValue: '0' },
			{ name: 'b', label: 'b', dataType: 'any', isArray: false, defaultValue: '0' },
			{ name: 'operator', label: 'operator', dataType: 'str', isArray: false, defaultValue: '==' },
		],
		outputs: [
			{ name: 'result', label: 'result', dataType: 'bool', isArray: false },
			{ name: 'a', label: 'a', dataType: 'any', isArray: false },
			{ name: 'b', label: 'b', dataType: 'any', isArray: false },
		],
	},

	merge: {
		kind: 'merge', category: 'transform', label: 'Merge',
		inputValues: { a: '', b: '' },
		config: {},
		inputs: [
			{ name: 'a', label: 'a', dataType: 'obj', isArray: false, defaultValue: '' },
			{ name: 'b', label: 'b', dataType: 'obj', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'obj', isArray: false },
		],
	},

	aggregate: {
		kind: 'aggregate', category: 'transform', label: 'Aggregate',
		inputValues: { in: '', window: '5s', fn: 'sum' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'float', isArray: true, defaultValue: '' },
			{ name: 'window', label: 'window', dataType: 'str', isArray: false, defaultValue: '5s' },
			{ name: 'fn', label: 'fn', dataType: 'str', isArray: false, defaultValue: 'sum' },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'float', isArray: false },
			{ name: 'count', label: 'count', dataType: 'int', isArray: false },
		],
	},

	format: {
		kind: 'format', category: 'transform', label: 'Format',
		inputValues: { in: '', template: '' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'obj', isArray: false, defaultValue: '' },
			{ name: 'template', label: 'template', dataType: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'str', isArray: false },
		],
	},

	regex: {
		kind: 'regex', category: 'transform', label: 'Regex',
		inputValues: { in: '', pattern: '' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'pattern', label: 'pattern', dataType: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'match', label: 'match', dataType: 'bool', isArray: false },
			{ name: 'groups', label: 'groups', dataType: 'obj', isArray: false },
		],
	},

	encode: {
		kind: 'encode', category: 'transform', label: 'Encode / Decode',
		inputValues: { in: '', format: 'json', mode: 'encode' },
		config: {},
		inputs: [
			{ name: 'in', label: 'in', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'format', label: 'format', dataType: 'str', isArray: false, defaultValue: 'json' },
			{ name: 'mode', label: 'mode', dataType: 'str', isArray: false, defaultValue: 'encode' },
		],
		outputs: [
			{ name: 'out', label: 'out', dataType: 'str', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	// ── SINKS ──────────────────────────────────────────────────────────────────

	// http is shared — appears in sources and sinks. Same template, category set at spawn time.

	log: {
		kind: 'log', category: 'sink', label: 'Log',
		inputValues: { in: '', label: '', mode: 'console', path: '' },
		config: { mode: 'console' }, // 'console' | 'file'
		inputs: [
			{ name: 'in', label: 'in', dataType: 'any', isArray: false, defaultValue: '' },
			{ name: 'label', label: 'label', dataType: 'str', isArray: false, defaultValue: '' },
			{
				name: 'path', label: 'path', dataType: 'str', isArray: false, defaultValue: '',
				activeWhen: { config: 'mode', value: 'file' }
			},
			{
				name: 'flush', label: 'flush', dataType: 'pulse', isArray: false, defaultValue: '',
				activeWhen: { config: 'mode', value: 'file' }
			},
		],
		outputs: [],
	},

	db_write: {
		kind: 'db_write', category: 'sink', label: 'DB Write',
		inputValues: { data: '', table: '', key: '' },
		config: {},
		inputs: [
			{ name: 'data', label: 'data', dataType: 'obj', isArray: false, defaultValue: '' },
			{ name: 'table', label: 'table', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'key', label: 'key', dataType: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'success', label: 'success', dataType: 'bool', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	webhook: {
		kind: 'webhook', category: 'sink', label: 'Webhook',
		inputValues: { trigger: '', url: '', payload: '{}' },
		config: {},
		inputs: [
			{ name: 'trigger', label: 'trigger', dataType: 'pulse', isArray: false, defaultValue: '' },
			{ name: 'url', label: 'url', dataType: 'str', isArray: false, defaultValue: '' },
			{ name: 'payload', label: 'payload', dataType: 'obj', isArray: false, defaultValue: '{}' },
		],
		outputs: [
			{ name: 'status', label: 'status', dataType: 'int', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},

	publish: {
		kind: 'publish', category: 'sink', label: 'Publish',
		inputValues: { message: '', topic: '' },
		config: {},
		inputs: [
			{ name: 'message', label: 'message', dataType: 'obj', isArray: false, defaultValue: '' },
			{ name: 'topic', label: 'topic', dataType: 'str', isArray: false, defaultValue: '' },
		],
		outputs: [
			{ name: 'success', label: 'success', dataType: 'bool', isArray: false },
			{ name: 'error', label: 'error', dataType: 'str', isArray: false },
		],
	},
};

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar menu structure
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolbarMenuItem {
	kind: NodeKind;
	label: string;
	/** Override category — used for http which appears in both sources and sinks */
	categoryOverride?: NodeCategory;
}

export interface ToolbarMenu {
	label: string;
	category: NodeCategory;
	color: string;
	items: ToolbarMenuItem[];
}

export const TOOLBAR_MENUS: ToolbarMenu[] = [
	{
		label: 'Sources',
		category: 'source',
		color: '#22c55e',
		items: [
			{ kind: 'constant', label: 'Constant' },
			{ kind: 'http', label: 'HTTP' },
			{ kind: 'websocket', label: 'WebSocket' },
			{ kind: 'timer', label: 'Timer' },
			{ kind: 'csv', label: 'CSV / File' },
		],
	},
	{
		label: 'Transforms',
		category: 'transform',
		color: '#3b82f6',
		items: [
			{ kind: 'parse_obj', label: 'Parse Object' },
			{ kind: 'map', label: 'Map' },
			{ kind: 'filter', label: 'Filter' },
			{ kind: 'branch', label: 'Branch' },
			{ kind: 'compare', label: 'Compare' },
			{ kind: 'merge', label: 'Merge' },
			{ kind: 'aggregate', label: 'Aggregate' },
			{ kind: 'format', label: 'Format' },
			{ kind: 'regex', label: 'Regex' },
			{ kind: 'encode', label: 'Encode / Decode' },
		],
	},
	{
		label: 'Sinks',
		category: 'sink',
		color: '#ef4444',
		items: [
			{ kind: 'http', label: 'HTTP', categoryOverride: 'sink' },
			{ kind: 'log', label: 'Log' },
			{ kind: 'db_write', label: 'DB Write' },
			{ kind: 'webhook', label: 'Webhook' },
			{ kind: 'publish', label: 'Publish' },
		],
	},
];

// ─────────────────────────────────────────────────────────────────────────────
// Visual tokens
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_COLOR: Record<NodeCategory, string> = {
	source: '#22c55e',
	transform: '#3b82f6',
	sink: '#ef4444',
};

export const CATEGORY_HEADER_COLOR: Record<NodeCategory, string> = {
	source: 'rgb(15, 100, 60)',
	transform: 'rgb(30, 64, 140)',
	sink: 'rgb(120, 30, 30)',
};

export const DATA_TYPE_META: Record<DataType, { label: string; color: string }> = {
	any: { label: 'Any', color: '#9ca3af' },
	str: { label: 'String', color: '#00daa0' },
	int: { label: 'Integer', color: '#fb9907' },
	float: { label: 'Float', color: '#ee3c0f' },
	bool: { label: 'Boolean', color: '#a78bfa' },
	date: { label: 'Date', color: '#d3a4d9' },
	obj: { label: 'Object', color: '#50bfe1' },
	pulse: { label: 'Pulse', color: '#facc15' },
	encrypted: { label: 'Encrypted', color: '#c5c5c5' },
	unknown: { label: 'Unknown', color: '#6b7280' },
};

export const DATA_TYPE_COLOR = Object.fromEntries(
	Object.entries(DATA_TYPE_META).map(([k, v]) => [k, v.color])
) as Record<DataType, string>;

export const NODE_WIDTH = 220;
export const PORT_SIZE = 10;
export const EDGE_BEZIER_TENSION = 0.5;
export const EDGE_BEZIER_OFFSET = 30;
export const OP_TIMEOUT_MS = 5000;
export const POSITION_DEBOUNCE_MS = 300;