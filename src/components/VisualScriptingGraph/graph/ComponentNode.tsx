import React, { useState, useEffect } from 'react';
import { Component } from '../components/types';
import Argument from './Argument';
import Export from './Export';
import Block from './Block';
import nodeStateManager from './nodeStateManager';
import './ComponentNode.css';

type ComponentNodeProps = {
  data: Component;
  id: string;
};

const ComponentNode: React.FC<ComponentNodeProps> = ({ data, id }) => {
  const [checkedArgs, setCheckedArgs] = useState<{ [key: string]: boolean }>(() =>
    data.arguments.reduce((acc, arg) => {
      acc[arg.name] = arg.required;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const [argValues, setArgValues] = useState<{ [key: string]: string }>(() =>
    data.arguments.reduce((acc, arg) => {
      acc[arg.name] = arg.default === undefined ? '' : arg.default;
      return acc;
    }, {} as { [key: string]: string })
  );

  useEffect(() => {
    nodeStateManager.setNodeSetters(id, { setCheckedArgs, setArgValues });
    return () => {
      nodeStateManager.setNodeSetters(id, null)
    };
  }, [id, setCheckedArgs, setArgValues]);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCheckedArgs((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (name: string, value: string) => {
    setArgValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <div>
        <strong>{data.name}{data.hasLabel ? ` "${data.label}"` : ''}</strong>
      </div>
      {data.arguments.length > 0 && (
        <div>
          <hr />
          <i>Arguments:</i>
          <ul className="no-bullets">
            {data.arguments.map((arg, index) => (
              <Argument
                key={index}
                arg={arg}
                checked={checkedArgs[arg.name]}
                onChange={handleCheckboxChange}
                onInputChange={handleInputChange}
                nodeId={id}
                value={argValues[arg.name]}
              />
            ))}
          </ul>
        </div>
      )}
      {data.blocks.length > 0 && (
        <div>
          <hr />
          <ul className="no-bullets">
            {data.blocks.map((block, index) => (
              <Block
                key={index}
                block={block}
                prefix={id}
              />
            ))}
          </ul>
        </div>
      )}
      {data.exports.length > 0 && (
        <div>
          <hr />
          <i>Exports:</i>
          <ul className="no-bullets">
            {data.exports.map((exp, index) => (
              <Export
                key={index}
                exp={exp}
                nodeId={id}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ComponentNode;
