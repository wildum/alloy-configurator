import React, { useState, useEffect, useCallback } from 'react';
import { Component } from '../components/types';
import Argument from './Argument';
import Export from './Export';
import { useReactFlow, Connection } from '@xyflow/react';
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

  const handleConnect = useCallback((connection: Connection) => {
      const sourceHandle = connection.sourceHandle?.split('-')[0];
      const targetHandle = connection.targetHandle?.split('-')[0];

      if (targetHandle) {
        const setters = nodeStateManager.getNodeSetters(connection.target);
        if (setters) {
          setters.setCheckedArgs((prev) => ({ ...prev, [targetHandle]: true }));
          setters.setArgValues((prev) => ({
            ...prev,
            [targetHandle]: `${connection.source}.${sourceHandle}` || '',
          }));
        }
      }
  }, []);

  return (
    <div className="card">
      <div>
        <strong>{data.name}{data.hasLabel ? ` "${data.label}"`  : ''}</strong>
      </div>
      <hr />
      <div>
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
              onConnect={handleConnect}
            />
          ))}
        </ul>
      </div>
      <hr />
      <div>
      <i>Exports:</i>
        <ul className="no-bullets">
          {data.exports.map((exp, index) => (
            <Export
              key={index}
              exp={exp}
              onConnect={handleConnect}
            />
          ))}
        </ul>
      </div>
      <hr />
    </div>
  );
};

export default ComponentNode;
