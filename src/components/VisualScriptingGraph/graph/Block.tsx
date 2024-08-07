import React, { useState, useEffect } from 'react';
import { Block as BlockType } from '../components/types';
import Argument from './Argument';
import './Block.css';
import nodeStateManager from './nodeStateManager';

type BlockProps = {
    block: BlockType;
    prefix: string;
    onAddBlock: (block: BlockType) => void;
    index: number;
  };

const Block: React.FC<BlockProps> = ({ block, prefix, onAddBlock, index }) => {
    const id = `${prefix}.${block.name}${index}`;
    const [isChecked, setIsChecked] = useState(block.required || block.setOnLoad);
    const [blocks, setBlocks] = useState<BlockType[]>(block.blocks);

    const [checkedArgs, setCheckedArgs] = useState<{ [key: string]: boolean }>(() =>
        block.arguments.reduce((acc, arg) => {
            acc[arg.name] = arg.required || arg.setOnLoad;
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

    const exportTypes: { [key: string]: string } = {};

    useEffect(() => {
        nodeStateManager.setFn(id, {
            setCheckedArgs,
            getCheckedArgs: () => checkedArgs,
            setArgValues,
            getArgValues: () => argValues,
            exportTypes,
            isChecked: () => isChecked,
            getBlocks: () => blocks,
        });
        return () => {
            nodeStateManager.setFn(id, null);
        };
    }, [id, checkedArgs, argValues, isChecked]);

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setCheckedArgs((prev) => ({ ...prev, [name]: checked }));
    };

    const handleInputChange = (name: string, value: string) => {
        setArgValues((prev) => ({
            ...prev,
            [name]: { ...prev[name], value }
        }));
    };

    const handleBlockCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsChecked(e.target.checked);
    };

    const handleAddBlock = (block: BlockType) => {
        const newBlock = structuredClone(block)
        setBlocks((prevBlocks) => [...prevBlocks, { ...newBlock }]);
      };

    return (
        <div className="blockContainer">
            <div className="blockHeader">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={handleBlockCheckboxChange}
                    className="block-checkbox"
                    disabled={block.required}
                />
                <strong className="blockName">{block.name}</strong>
                {(block.unique !== undefined && !block.unique) && (
                    <button onClick={() => onAddBlock(block)} className="add-button">+</button>
                )}
            </div>
            {isChecked && (
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
                    {blocks.length > 0 && (
                        <div className="nestedBlocksSection">
                            <ul className="nestedBlocksList">
                                {blocks.map((b, index) => (
                                    <Block
                                        key={index}
                                        block={b}
                                        prefix={id}
                                        onAddBlock={handleAddBlock}
                                        index={index}
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