import React, { useState } from 'react';
import { Component } from '../components/types';
import Argument from './Argument';
import './ComponentNode.css';
import Export from './Export';

type ComponentNodeProps = {
  data: Component;
  id: string;
};

function ComponentNode({ data, id }: ComponentNodeProps) {
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setCheckedArgs((prev) => ({ ...prev, [name]: checked }));
  };

  const handleInputChange = (name: string, value: string) => {
    setArgValues((prev) => ({ ...prev, [name]: value }));
  };

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
            />
          ))}
        </ul>
      </div>
      <hr />
      <div>
        Blocks:
        <ul>
          {data.blocks.map((block, index) => (
            <li key={index}>
              <div>
                <strong>Name:</strong> {block.name}
              </div>
              <div>
                <strong>Documentation:</strong> {block.doc}
              </div>
              <div>
                <strong>Required:</strong> {block.required ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Arguments:</strong>
                <ul>
                  {block.arguments.map((arg, idx) => (
                    <li key={idx}>
                      <div>
                        <strong>Name:</strong> {arg.name}
                      </div>
                      <div>
                        <strong>Type:</strong> {arg.type}
                      </div>
                      <div>
                        <strong>Documentation:</strong> {arg.doc}
                      </div>
                      <div>
                        <strong>Required:</strong> {arg.required ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <strong>Default:</strong> {arg.default === undefined ? 'None' : arg.default}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <strong>Blocks:</strong>
                <ul>
                  {block.blocks.map((subBlock, idx) => (
                    <li key={idx}>
                      <div>
                        <strong>Name:</strong> {subBlock.name}
                      </div>
                      <div>
                        <strong>Documentation:</strong> {subBlock.doc}
                      </div>
                      <div>
                        <strong>Required:</strong> {subBlock.required ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <strong>Arguments:</strong>
                        <ul>
                          {subBlock.arguments.map((arg, idx) => (
                            <li key={idx}>
                              <div>
                                <strong>Name:</strong> {arg.name}
                              </div>
                              <div>
                                <strong>Type:</strong> {arg.type}
                              </div>
                              <div>
                                <strong>Documentation:</strong> {arg.doc}
                              </div>
                              <div>
                                <strong>Required:</strong> {arg.required ? 'Yes' : 'No'}
                              </div>
                              <div>
                                <strong>Default:</strong> {arg.default === undefined ? 'None' : arg.default}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Blocks:</strong>
                        <ul>
                          {subBlock.blocks.map((innerBlock, idx) => (
                            <li key={idx}>
                              <div>
                                <strong>Name:</strong> {innerBlock.name}
                              </div>
                              <div>
                                <strong>Documentation:</strong> {innerBlock.doc}
                              </div>
                              <div>
                                <strong>Required:</strong> {innerBlock.required ? 'Yes' : 'No'}
                              </div>
                              {/* Recursive block handling */}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ComponentNode;
