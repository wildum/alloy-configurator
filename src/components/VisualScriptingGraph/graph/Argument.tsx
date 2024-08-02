import React, { useState, useEffect } from 'react';
import { Argument as ArgumentType } from '../components/types';
import { Handle, Position } from '@xyflow/react';
import './Argument.css';

type ArgumentProps = {
  arg: ArgumentType;
  checked: boolean;
  onChange: () => void;
  onInputChange: (name: string, value: string) => void;
};

const Argument: React.FC<ArgumentProps> = ({ arg, checked, onChange, onInputChange }) => {
  const [inputValue, setInputValue] = useState<string>(arg.default === undefined ? '' : arg.default);

  useEffect(() => {
    setInputValue(arg.default === undefined ? '' : arg.default);
  }, [arg.default]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onInputChange(arg.name, e.target.value);
  };

  return (
    <li style={{ opacity: checked ? 1 : 0.5 }} className="argument-item">
      <Handle id={`${arg.name}-targetLeft`} type="target" position={Position.Left} />
      <Handle id={`${arg.name}-targetRight`} type="target" position={Position.Right} />
      <div style={{margin:"10px"}}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="argument-checkbox nodrag"
          disabled={arg.required}
        />
        <span title={`${arg.type}\n${arg.doc}`}>
          {arg.name}
        </span>
        {(arg.required || checked) && (
          <input
            id={arg.name}
            name={arg.name}
            value={inputValue}
            onChange={handleInputChange}
            className="argument-input nodrag"
          />
        )}
      </div>
    </li>
  );
};

export default Argument;
