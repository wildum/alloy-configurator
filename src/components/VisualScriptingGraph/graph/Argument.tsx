import React, { useEffect, useRef } from 'react';
import { Argument as ArgumentType } from '../components/types';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import './Argument.css';

type ArgumentProps = {
  arg: ArgumentType;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
  onInputChange: (name: string, value: string) => void;
  nodeId: string;
  value: string;
};

const Argument: React.FC<ArgumentProps> = ({ arg, checked, onChange, onInputChange, nodeId, value }) => {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [checked, nodeId, updateNodeInternals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(arg.name, e.target.value || "");
  };

  return (
    <li style={{ opacity: checked ? 1 : 0.5 }} className="argument-item">
      <Handle
        id={`${nodeId}.${arg.name}-targetLeft`}
        type="target"
        position={Position.Left}
      />
      <Handle
        id={`${nodeId}.${arg.name}-targetRight`}
        type="target"
        position={Position.Right}
      />
      <div style={{ margin: "10px", display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onChange(arg.name, !checked)}
          className="argument-checkbox nodrag"
          disabled={arg.required}
        />
        <span title={`${arg.type}\n${arg.doc}`} className="argument-name">
          {arg.name}
        </span>
        {(arg.required || checked) ? (
          <input
            id={arg.name}
            name={arg.name}
            value={value ?? ""}
            onChange={handleInputChange}
            className="argument-input nodrag"
          />
        ) : (
          <span
            className="argument-value-text nodrag"
            style={{ color: 'grey', marginLeft: '5px' }}
          >
            {value ?? ""}
          </span>
        )}
      </div>
    </li>
  );
};

export default Argument;
