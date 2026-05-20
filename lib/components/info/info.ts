/*------------------------------------ info.ts -----------------------------------*\
| Author: Clayton Wiley                                                            |
| Copy:   Copyright © 2026                                                         |
| Path:   ./lib/components/info/info.ts                                            |
| Descr: Stealing both the structure and content of this info panel from my        |
|   website (if it ain't broke :), this is the single source of truth for          |
|   everything in the info popup. It also defines some types and code snippits.    |
\*--------------------------------------------------------------------------------*/


// All the card types
export type LinkIcon = "github" | "docs" | "demo" | "paper" | "video";

export type InfoLink = {
	label: string;
	url: string;
	icon?: LinkIcon;
};

// Added this which allows for code blocks inline using shiki formatting
export type CodeSrc = {
	title: string;
	filename: string;
	url: string;
	src: string; // just code as a multiline string
}

export type Tab = {
	id: string;
	label: string;
	body?: string;
	youtubeId?: string;
	photoSrc?: string;
	codeSrc?: CodeSrc;
	links?: InfoLink[];
};

export type Info = {
	title: string;
	subtitle?: string;
	photo: string;
	tags?: string[];
	tabs: Tab[];
};


const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';


const code1: string = `timer: {
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
}`

const code2: string = `addNode(partial: Omit<NodeDef, 'id'>): NodeDef {
	const node: NodeDef = { ...partial, id: uid() };
	const { _applyAddNode, _applyRemoveNode } = useGraphStore.getState();

	_applyAddNode(node);												// <- edit is applied optimisitically
	send({ type: 'ADD_NODE', node }, () => _applyRemoveNode(node.id));  // <- command is sent to backend with corresponding rollback

	return node;
}

...

function send(op: GraphOp, rollbackFn: () => void): string {
	const txId = _syncLayer.sendOp(op);    	// <- backend sync layer returns the transaction id
	pendingOps.register(txId, rollbackFn);	// <- rollback function is cached with transaction id to rollback if necessary
	return txId;
}`


// ─── Info ─────────────────────────────────────────────────────────────

export const infoSrc: Info = {
	title: "Graphical Dataflow Node-based Editor",
	subtitle: "A more intuitive way to route data",
	photo: basePath + "/images/info/Nodeeditor.png",
	tags: ["TypeScript", "React", "SaaS", "Data Pipelines", "Industrial IoT", "UI/UX Design", "Optimistic Dispatching", "Front/Backend Sync"],
	tabs: [
		{
			id: "overview",
			label: "Overview",
			body: `When I started at Casne Engineering Inc. in my Sophomore year of college, I was put to work on CloudStream, a new SaaS platform that is in production now, “providing flexible, reliable, and secure industrial data pipelines wherever you need them.” The project meant to make all disparate data sources and endpoints connectable so that clients wouldn’t have to navigate the messy transfer process on their own.

My job was to create the UI, a platform which Casne Employees would use internally to manage these connection points. I started with something serviceable (though clunky). But after getting the basic system working, and inspired by graphical node editors like those found in Blender or MatLab’s Simulink, I began an independent project to create a functional, visually intuitive design to level up the platform. The duration of the summer meant it wasn’t feasible to implement this system, but it remains one of the most robust software projects I’ve worked on and I believe it will find a home somewhere.

Though just a proof of concept with a stubbed backend (read more in future tabs), I hope this demo shows a functional enough (I hope) frontend system to demonstrate the intention. Feel free to play around!`,
		},
		{
			id: "frontend",
			label: "Frontend Functionality",
			body: `The concept is simple: data flows from source to endpoint, so let’s show that happening. Using graphical source and endpoint nodes, the data’s movement is visually intuitive. A source is polled, it passes to the end point, it’s posted, and done. So I stopped there.

No I didn’t! I figured as long as I have a visual transfer of data, why not do something more than source to endpoint? I implemented a rudimentary typing system, an assortment of sources and endpoints, and then some control and transformation nodes. Being able to parse objects, filter, merge, run custom functions, and a dozen other new additions leveled up the functionality of the system 10-fold. As the front end doesn’t actually need to move/transform the data and everything is established through configuration files, adding new behaviors is extremely simple.`,
			codeSrc: { title: "Example Node Definition", filename: "constants/index.ts", url: "https://github.com/klaytonme/nodeeditor.git", src: code1 },
		},
		{
			id: "sync",
			label: "Sync Layer",
			body: `But as mentioned, this design doesn’t actually touch data. This is just a tantalizing nothing burger if it can’t actually talk to the backend. I built the system to be backend agnostic, and ensured the user experience was responsive while respecting the backend as the single source of truth on dataflow. To satisfy these requirements, this platform implements an optimistic dispatch system:
- A user makes an edit like adding a new node or connecting two existing nodes
- That edit is implemented immediately in the front end so the user sees the change
- The edit is sent by the system dispatcher to the backend and then cached with a corresponding rollback function
- If the backend responds with an acknowledgement, great
- If it times out, or sends an error, the rollback function is called: the edit is undone and the user is notified something has gone wrong

A snippet of this dispatch system can be seen below. For full code, see the GitHub in the links tab

This demo is currently stubbed with a simulated backend which responds with acknowledgement after 100ms of latency (this can be seen in the log window).`,
			codeSrc: { title: "Dispatch Snapshot", filename: "sync/dispatch.ts", url: "https://github.com/klaytonme/nodeeditor.git", src: code2 },
		},
		{
			id: "future",
			label: "Future Work",
			body: `While a functional proof of concept, this demo is lacking  many features that would take it to production. My todo list of upgrades consists of (among others)
- Implementing keyboard shortcuts, scroll, select, and other ease of use features
- A more robust typing system with connection validation
- A graphical debugging system
- A system listener providing a view of real-time data as it moves through the nodes
- More node varieties, in particular flow and control blocks

Should this project ever find a new home, I will be eager to jump back into the development process.`,
		},
		{
			id: "parse",
			label: "Highlight: Parse Object",
			body: `The parse object node in particular demonstrates the flexibility of this system. The block takes an object in and parses it, separating out the keys of the input into distinct outputs. The block has a listen feature which can observe incoming data and populate the output keys to match. Alternatively, users can manually add expected keys and create corresponding outputs blindly.

This is a good demonstration of disparate functionality enabled through a cohesive user-experience. Despite having unique functionality, the implementation of this block is visually similar to maintain the intuitive design flow. I hope it is clear how easy it is to add, change, or upgrade node behavior.`,
			photoSrc: basePath + "/images/info/parseObj.png"
		},
		{
			id: "links",
			label: "Links",
			body: "",
			links: [
				{ label: "Codebase", url: "https://github.com/klaytonme/nodeeditor.git", icon: "github" },
				{ label: "Original Raw JS Version", url: "https://github.com/klaytonme/CloudStream4.0.git", icon: "github" },
				{ label: "Casne's CloudStream", url: "https://casne.com/cloudstream", icon: "docs" },
			]
		}
	]
};