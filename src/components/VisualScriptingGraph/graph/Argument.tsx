import React, { useEffect, useRef } from 'react';
import { Argument as ArgumentType } from '../components/types';
import { Handle, Position, useUpdateNodeInternals, Connection } from '@xyflow/react';
import './Argument.css';

type ArgumentProps = {
  arg: ArgumentType;
  checked: boolean;
  onChange: (name: string, checked: boolean) => void;
  onInputChange: (name: string, value: string) => void;
  nodeId: string;
  value: string;
  onConnect: (connection: Connection) => void;
};

const Argument: React.FC<ArgumentProps> = ({ arg, checked, onChange, onInputChange, nodeId, value, onConnect }) => {
  const updateNodeInternals = useUpdateNodeInternals();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    updateNodeInternals(nodeId);
  }, [checked, nodeId, updateNodeInternals]);

  useEffect(() => {
    if (inputRef.current) {
      adjustInputWidth(inputRef.current);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onInputChange(arg.name, e.target.value);
    adjustInputWidth(e.target);
  };

  const adjustInputWidth = (input: HTMLInputElement) => {
    input.style.width = 'auto';
    input.style.width = `${input.scrollWidth}px`;
  };

  return (
    <li style={{ opacity: checked ? 1 : 0.5 }} className="argument-item">
      <Handle
        id={`${arg.name}-targetLeft`}
        type="target"
        position={Position.Left}
        onConnect={onConnect}
      />
      <Handle
        id={`${arg.name}-targetRight`}
        type="target"
        position={Position.Right}
        onConnect={onConnect}
      />
      <div style={{margin:"10px", display: "flex", alignItems: "center"}}>
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
            ref={inputRef}
            id={arg.name}
            name={arg.name}
            value={value == undefined ? "null" : value}
            onChange={handleInputChange}
            className="argument-input nodrag"
            style={{minWidth: "20px", maxWidth: "100%"}}
          />
        ) : (
          <span 
            className="argument-value-text nodrag" 
            style={{color: 'grey', marginLeft: '5px'}}
          >
            {value == undefined ? "null" : value}
          </span>
        )}
      </div>
    </li>
  );
};

export default Argument;