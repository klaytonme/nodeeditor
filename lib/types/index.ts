// ─────────────────────────────────────────────────────────────────────────────
// Core graph types — these are what get synced to the backend
// ─────────────────────────────────────────────────────────────────────────────

export type NodeType = 'source' | 'transform' | 'filter' | 'aggregate' | 'sink';

// Data types carried on ports — drives colour and shape of the port indicator
export type DataType = 'str' | 'int' | 'float' | 'date' | 'obj' | 'bool' | 'pulse' | 'encrypted' | 'unknown';

export interface PortDef {
	name: string;       // unique within the node
	label: string;      // display label
	type: DataType;
	isArray: boolean;   // array = rotated square, scalar = circle
	defaultValue?: string;
}

export interface NodeDef {
	id: string;
	type: NodeType;
	label: string;
	inputValues: Record<string, string>;
	config: Record<string, string>;
	inputs: PortDef[];
	outputs: PortDef[];
}

export interface EdgeDef {
	id: string;
	src: string;      // node id
	srcPort: string;
	dst: string;      // node id
	dstPort: string;
}

export interface GraphState {
	nodes: Record<string, NodeDef>;
	edges: Record<string, EdgeDef>;
	version: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI-only types — never sent to the backend
// ─────────────────────────────────────────────────────────────────────────────

export interface XYPosition {
	x: number;
	y: number;
}

export interface PortPosition extends XYPosition {
	side: 'input' | 'output';
}

export type SelectionTarget =
	| { kind: 'node'; id: string }
	| { kind: 'edge'; id: string }
	| null;

export interface UIState {
	positions: Record<string, XYPosition>;
	selected: SelectionTarget;
	viewport: { x: number; y: number; zoom: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Op types — the unit of sync between client and backend
// ─────────────────────────────────────────────────────────────────────────────

export type GraphOp =
	| { type: 'ADD_NODE'; node: NodeDef }
	| { type: 'REMOVE_NODE'; id: string }
	| { type: 'UPDATE_CONFIG'; id: string; patch: Partial<Record<string, string>> }
	| { type: 'UPDATE_INPUT'; id: string; port: string; value: string }
	| { type: 'ADD_EDGE'; edge: EdgeDef }
	| { type: 'REMOVE_EDGE'; id: string };

// ─────────────────────────────────────────────────────────────────────────────
// Sync layer interface — the contract syncLayer must satisfy.
// Swap the stub implementation for a real WebSocket without touching anything else.
// ─────────────────────────────────────────────────────────────────────────────

export type SyncStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'error';

export interface SyncLayer {
	/** Fire an op. Returns a txId the caller can use to track ACK/NACK. */
	sendOp: (op: GraphOp) => string;
	status: SyncStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Log entry type (for the debug panel)
// ─────────────────────────────────────────────────────────────────────────────

export type LogLevel = 'op' | 'ack' | 'err' | 'ws' | 'info';

export interface LogEntry {
	id: string;
	time: Date;
	level: LogLevel;
	message: string;
}