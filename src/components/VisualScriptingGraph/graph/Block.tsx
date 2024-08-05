import React, { useState } from 'react';
import { Connection } from '@xyflow/react';
import { Block as BlockType } from '../components/types';
import Argument from './Argument';
import './Block.css';

type BlockProps = {
    block: BlockType;
    onConnect: (connection: Connection) => void;
    nodeId: string;
};

const Block: React.FC<BlockProps> = ({ block, nodeId, onConnect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [checkedArgs, setCheckedArgs] = useState<{ [key: string]: boolean }>(() =>
        block.arguments.reduce((acc, arg) => {
            acc[arg.name] = arg.required;
            return acc;
        }, {} as { [key: string]: boolean })
    );

    const [argValues, setArgValues] = useState<{ [key: string]: string }>(() =>
        block.arguments.reduce((acc, arg) => {
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
                                        nodeId={nodeId}
                                        value={argValues[arg.name]}
                                        onConnect={onConnect}
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
                                        onConnect={onConnect}
                                        nodeId={nodeId}
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