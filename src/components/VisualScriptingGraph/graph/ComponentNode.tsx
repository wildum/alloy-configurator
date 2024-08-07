import React, { useState, useEffect, useMemo } from 'react';
import { Component, Block as BlockType } from '../components/types';
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
  const [blocks, setBlocks] = useState<BlockType[]>(data.blocks);
  const [checkedArgs, setCheckedArgs] = useState<{ [key: string]: boolean }>(() =>
    data.arguments.reduce((acc, arg) => {
      acc[arg.name] = arg.required || arg.setOnLoad;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const [argValues, setArgValues] = useState<{ [key: string]: { value: string; type: string } }>(() =>
    data.arguments.reduce((acc, arg) => {
      acc[arg.name] = {
        value: arg.default === undefined ? '' : arg.default,
        type: arg.type
      };
      return acc;
    }, {} as { [key: string]: { value: string; type: string } })
  );

  const exportTypes = useMemo(() =>
    data.exports.reduce((acc, exp) => {
      acc[exp.name] = exp.type;
      return acc;
    }, {} as { [key: string]: string })
    , [data.exports]);

  useEffect(() => {
    nodeStateManager.setFn(id, {
      setCheckedArgs,
      getCheckedArgs: () => checkedArgs,
      setArgValues,
      getArgValues: () => argValues,
      exportTypes,
      isChecked: () => true,
      getBlocks: () => blocks,
    });
    return () => {
      nodeStateManager.setFn(id, null)
    };
  }, [id, checkedArgs, argValues]);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCheckedArgs((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (name: string, value: string) => {
    setArgValues((prev) => ({
      ...prev,
      [name]: { ...prev[name], value }
    }));
  };

  const handleAddBlock = (block: BlockType) => {
    const newBlock = structuredClone(block)
    setBlocks((prevBlocks) => [...prevBlocks, { ...newBlock }]);
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
                value={argValues[arg.name].value}
              />
            ))}
          </ul>
        </div>
      )}
      {blocks.length > 0 && (
        <div>
          <hr />
          <ul className="no-bullets">
            {blocks.map((block, index) => {
              return (
              <Block
                key={index}
                block={block}
                prefix={id}
                onAddBlock={handleAddBlock}
                index={index}
              />
            )})}
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
