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

  getCheckedArgs(nodeId: string): { [key: string]: boolean } {
      const setters = this.getNodeSetters(nodeId);
      if (setters) {
          let checkedArgs: { [key: string]: boolean } = {};
          setters.setCheckedArgs((prev) => {
              checkedArgs = prev;
              return prev;
          });
          return checkedArgs;
      }
      return {};
  },
};

export default nodeStateManager;
