// NodeStateManager.ts
type SetCheckedArgs = React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
type SetArgValues = React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;

type NodeSetters = {
  setCheckedArgs: SetCheckedArgs;
  setArgValues: SetArgValues;
} | null;

const nodeStateManager = {
  nodeSetters: {} as { [key: string]: NodeSetters },

  setNodeSetters(nodeId: string, setters: NodeSetters) {
    this.nodeSetters[nodeId] = setters;
  },

  getNodeSetters(nodeId: string): NodeSetters {
    return this.nodeSetters[nodeId];
  },
};

export default nodeStateManager;
