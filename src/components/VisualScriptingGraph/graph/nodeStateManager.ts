type SetCheckedArgs = React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
type SetArgValues = React.Dispatch<React.SetStateAction<{ [key: string]: { value: string; type: string } }>>;
type GetCheckedArgs = () => { [key: string]: boolean };
type GetArgValues = () => { [key: string]: { value: string; type: string } };
type ExportTypes =  {[key: string]: string};
type isChecked = () => boolean

type Fns = {
  setCheckedArgs: SetCheckedArgs;
  setArgValues: SetArgValues;
  exportTypes: ExportTypes;
  isChecked: isChecked;
  getArgValues: GetArgValues;
  getCheckedArgs: GetCheckedArgs;
} | null;

const nodeStateManager = {
    fns: {} as { [key: string]: Fns },
    setFn(id: string, fns: Fns) {
      this.fns[id] = fns;
    },
    getFns(id: string) {
      return this.fns[id];
    },
    getNodeState(id: string): any {
      const fns = this.fns[id];
      if (fns) {
        return {
          checkedArgs: fns.getCheckedArgs(),
          argValues: fns.getArgValues(),
          isChecked: fns.isChecked(),
          ExportTypes: fns.exportTypes
        };
      }
      return null;
    }
  };
  
  export default nodeStateManager;
