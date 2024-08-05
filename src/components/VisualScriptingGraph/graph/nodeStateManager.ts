type SetCheckedArgs = React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
type SetArgValues = React.Dispatch<React.SetStateAction<{ [key: string]: { value: string; type: string } }>>;
type ExportTypes =  {[key: string]: string};

type ArgsFn = {
  setCheckedArgs: SetCheckedArgs;
  setArgValues: SetArgValues;
  ExportTypes: ExportTypes;
} | null;

const nodeStateManager = {
  ArgsFn: {} as { [key: string]: ArgsFn },

  setArgsFn(nodeId: string, argsFunctions: ArgsFn) {
      this.ArgsFn[nodeId] = argsFunctions;
  },

  getArgsFn(nodeId: string): ArgsFn {
      return this.ArgsFn[nodeId];
  },

  getCheckedArgs(nodeId: string): { [key: string]: boolean } {
      const setters = this.getArgsFn(nodeId);
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
