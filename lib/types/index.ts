// ─────────────────────────────────────────────────────────────────────────────
// Core graph types
// ─────────────────────────────────────────────────────────────────────────────

export type NodeCategory = 'source' | 'transform' | 'sink';

export type NodeKind =
	// Sources
	| 'constant'
	| 'http'
	| 'websocket'
	| 'timer'
	| 'csv'
	// Transforms
	| 'parse_obj'
	| 'map'
	| 'filter'
	| 'branch'
	| 'compare'
	| 'merge'
	| 'aggregate'
	| 'format'
	| 'regex'
	| 'encode'
	// Sinks
	| 'log'
	| 'db_write'
	| 'webhook'
	| 'publish';

export const DATA_TYPES = [
	'any', 'str', 'int', 'float', 'bool',
	'date', 'obj', 'pulse', 'encrypted', 'unknown'
] as const;

export type DataType = typeof DATA_TYPES[number];


export interface PortDef {
	name: string;
	label: string;
	dataType: DataType;
	isArray: boolean;
	defaultValue?: string;
	/** If true, this port is only active when a specific config value is set */
	activeWhen?: { config: string; value: string };
}

export interface NodeDef {
	id: string;
	kind: NodeKind;
	category: NodeCategory;
	label: string;
	inputValues: Record<string, string>;
	config: Record<string, string>;
	inputs: PortDef[];
	outputs: PortDef[];
}

export interface EdgeDef {
	id: string;
	src: string;
	srcPort: string;
	dst: string;
	dstPort: string;
}

export interface GraphState {
	nodes: Record<string, NodeDef>;
	edges: Record<string, EdgeDef>;
	version: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI types
// ─────────────────────────────────────────────────────────────────────────────

export interface XYPosition { x: number; y: number; }

export interface PortPosition extends XYPosition {
	side: 'input' | 'output';
}

export type SelectionTarget =
	| { kind: 'node'; id: string }
	| { kind: 'edge'; id: string }
	| null;

// ─────────────────────────────────────────────────────────────────────────────
// Op types
// ─────────────────────────────────────────────────────────────────────────────

export type GraphOp =
	| { type: 'ADD_NODE'; node: NodeDef }
	| { type: 'REMOVE_NODE'; id: string }
	| { type: 'UPDATE_CONFIG'; id: string; patch: Record<string, string> }
	| { type: 'UPDATE_INPUT'; id: string; port: string; value: string }
	| { type: 'ADD_EDGE'; edge: EdgeDef }
	| { type: 'REMOVE_EDGE'; id: string };

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';

export interface SyncLayer {
	sendOp: (op: GraphOp) => string;
	status: SyncStatus;
}

export type LogLevel = 'op' | 'ack' | 'err' | 'ws' | 'info';

export interface LogEntry {
	id: string;
	time: Date;
	level: LogLevel;
	message: string;
}