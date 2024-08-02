import React, { useState, useEffect, useRef } from 'react';
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

  const handleConnect = (params: any) => {
    console.log(params);
    if (params.targetHandle === `${arg.name}-targetLeft` || params.targetHandle === `${arg.name}-targetRight`) {
      onChange(arg.name, true);
      onInputChange(arg.name, params.source);
    }
  };

  return (
    <li style={{ opacity: checked ? 1 : 0.5 }} className="argument-item">
      <Handle
        id={`${arg.name}-targetLeft`}
        type="target"
        position={Position.Left}
        onConnect={handleConnect}
      />
      <Handle
        id={`${arg.name}-targetRight`}
        type="target"
        position={Position.Right}
        onConnect={handleConnect}
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
        {(arg.required || checked) && (
          <input
            ref={inputRef}
            id={arg.name}
            name={arg.name}
            value={value}
            onChange={handleInputChange}
            className="argument-input nodrag"
            style={{minWidth: "20px", maxWidth: "100%"}}
          />
        )}
      </div>
    </li>
  );
};

export default Argument;