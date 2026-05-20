addNode(partial: Omit<NodeDef, 'id'>): NodeDef {
	const node: NodeDef = { ...partial, id: uid() };
	const { _applyAddNode, _applyRemoveNode } = useGraphStore.getState();

	_applyAddNode(node);
	send({ type: 'ADD_NODE', node }, () => _applyRemoveNode(node.id));

	return node;
}