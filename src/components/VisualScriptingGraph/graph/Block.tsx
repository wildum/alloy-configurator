import React, { useState, useEffect } from 'react';
import { Block as BlockType } from '../components/types';
import Argument from './Argument';
import './Block.css';
import nodeStateManager from './nodeStateManager';

type BlockProps = {
    block: BlockType;
    prefix: string;
};

const Block: React.FC<BlockProps> = ({ block, prefix }) => {
    const id = prefix + "." + block.name
    const [isOpen, setIsOpen] = useState(false);

    const [checkedArgs, setCheckedArgs] = useState<{ [key: string]: boolean }>(() => 
        block.arguments.reduce((acc, arg) => {
            acc[arg.name] = arg.required;
            return acc;
        }, {} as { [key: string]: boolean })
    );

    const [argValues, setArgValues] = useState<{ [key: string]: { value: string; type: string } }>(() =>
        block.arguments.reduce((acc, arg) => {
            acc[arg.name] = {
                value: arg.default === undefined ? '' : arg.default,
                type: arg.type
            };
            return acc;
        }, {} as { [key: string]: { value: string; type: string } })
    );

    const ExportTypes : {[key: string]: string} = {};

    useEffect(() => {
        nodeStateManager.setArgsFn(id, { setCheckedArgs, setArgValues, ExportTypes });
        return () => {
            nodeStateManager.setArgsFn(id, null);
        };
    }, [id, setCheckedArgs, setArgValues]);
    
      const handleCheckboxChange = (name: string, checked: boolean) => {
        setCheckedArgs((prev) => ({ ...prev, [name]: checked }));
      };
    
      const handleInputChange = (name: string, value: string) => {
        setArgValues((prev) => ({
          ...prev,
          [name]: { ...prev[name], value }
        }));
      };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="blockContainer">
            <div className="blockHeader" onClick={toggleDropdown}>
                <strong>{block.name}</strong>
                <span className="arrow">{isOpen ? '▼' : '▶'}</span>
            </div>
            {isOpen && (
                <div className="blockContent">
                    {block.arguments.length > 0 && (
                        <div className="argumentsSection">
                            <i>Arguments:</i>
                            <ul className="argumentsList">
                                {block.arguments.map((arg, index) => (
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
                    {block.blocks.length > 0 && (
                        <div className="nestedBlocksSection">
                            <ul className="nestedBlocksList">
                                {block.blocks.map((b, index) => (
                                    <Block
                                        key={index}
                                        block={b}
                                        prefix={id}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Block;