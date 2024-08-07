import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
    BackgroundVariant,
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    OnSelectionChangeParams,
} from '@xyflow/react';
import { css } from '@emotion/css';

import '@xyflow/react/dist/style.css';
import ComponentNode from './graph/ComponentNode';
import nodeStateManager from './graph/nodeStateManager';
import { Component, Argument as ArgumentType, Block as BlockType, compareTypes } from './components/types';
import { marshallToAlloyConfig } from './convert/marshallAlloy';
import { unmarshallFromAlloyConfig } from './convert/unmarshallAlloy';
import { ExportedNode, ExportedArgument, ExportedBlock } from './convert/types'
import { buildGraph, getLayoutedElements } from './graph/buildGraph';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

function generateRandomString(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

function exportToFile(config: string) {
    const blob = new Blob([config], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'config.alloy';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

let components = new Map<string, Map<string, Component>>()

const VisualScriptingGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedElements, setSelectedElements] = useState<OnSelectionChangeParams>({ nodes: [], edges: [] });
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const nodeTypes = useMemo(() => ({ componentNode: ComponentNode }), []);

    useEffect(() => {
        loadComponentsFromFile().then(loadedComponents => {
            components = loadedComponents;
            setExpandedCategories(new Set());
        });
    }, []);

    const onConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
            setTimeout(() => {
                const sourceHandleParts = params.sourceHandle?.split('.');
                const targetHandleParts = params.targetHandle?.split('.');
                if (sourceHandleParts && targetHandleParts) {
                    const targetHandle = targetHandleParts.slice(0, -1).join('.');
                    const sourceHandle = sourceHandleParts.slice(0, -1).join('.');
                    const targetHandleFunctions = nodeStateManager.getFns(targetHandle);
                    const sourceHandleFunctions = nodeStateManager.getFns(sourceHandle);
                    if (targetHandleFunctions && sourceHandleFunctions) {
                        const targetArg = targetHandleParts[targetHandleParts.length - 1].split("-")[0];
                        const sourceArg = sourceHandleParts[sourceHandleParts.length - 1].split("-")[0];
                        targetHandleFunctions.setCheckedArgs((prev) => ({ ...prev, [targetArg]: true }));
                        targetHandleFunctions.setArgValues((prevTarget) => {
                            const newValue = `${params.source}.${sourceHandleParts[sourceHandleParts.length - 1].split("-")[0]}` || '';
                            const newValues = { ...prevTarget };

                            const sourceType = sourceHandleFunctions.exportTypes[sourceArg]
                            const targetType = prevTarget[targetArg].type;
                            const targetValue = prevTarget[targetArg].value;

                            // TODO: improve this
                            if (compareTypes(sourceType, targetType)) {
                                if (targetType.startsWith("list(") || targetType.startsWith("array")) {
                                    if (targetValue == undefined || targetValue == "[]" || targetValue == "null" || targetValue == "") {
                                        newValues[targetArg] = { value: newValue, type: targetType };
                                    } else if (targetValue.startsWith("concat")) {
                                        const trimmedValue = targetValue.slice(0, -2);
                                        newValues[targetArg] = { value: `${trimmedValue}, ${newValue}])`, type: targetType };
                                    } else {
                                        const trimmedValue = targetValue.slice(0, -1);
                                        newValues[targetArg] = { value: `concat(${trimmedValue}, ${newValue}])`, type: targetType };
                                    }
                                } else {
                                    newValues[targetArg] = { value: newValue, type: targetType };
                                }
                            } else if (targetType.startsWith('list(') || targetType.startsWith('array(')) {
                                if (targetValue == undefined || targetValue == "[]" || targetValue == "null" || targetValue == "") {
                                    newValues[targetArg] = { value: `[${newValue}]`, type: targetType };
                                } else {
                                    const trimmedValue = targetValue.slice(0, -1);
                                    newValues[targetArg] = { value: `${trimmedValue}, ${newValue}]`, type: targetType };
                                }
                            } else {
                                console.warn("types are different: ", sourceType, targetType)
                            }
                            return newValues;
                        })
                    }
                }
            }, 0);
        },
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const componentData = event.dataTransfer.getData('application/reactflow').split('|');
            const category = componentData[0];
            const componentName = componentData[1];

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - reactFlowBounds.left;
            const y = event.clientY - reactFlowBounds.top;

            const position = { x, y };

            const component = structuredClone(components.get(category)?.get(componentName));

            if (component) {
                if (component.hasLabel) {
                    component.label = generateRandomString(6);
                }

                const id = component.name + (component.hasLabel ? "." + component.label : "");

                const newNode: Node = {
                    id: id,
                    type: 'componentNode',
                    position,
                    data: component,
                };

                setNodes((nds) => nds.concat(newNode));
            }
        },
        [setNodes]
    );

    const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
        setSelectedElements(params);
    }, []);

    const selectedNodesIds = useMemo(() => new Set(selectedElements.nodes.map(n => n.id)), [selectedElements.nodes]);
    const selectedEdgesIds = useMemo(() => new Set(selectedElements.edges.map(e => e.id)), [selectedElements.edges]);

    const styledNodes = useMemo(() =>
        nodes.map(node => ({
            ...node,
            style: {
                ...node.style,
                boxShadow: selectedNodesIds.has(node.id) ? '0 0 0 2px #ff6b6b' : undefined,
            },
        })),
        [nodes, selectedNodesIds]);

    const styledEdges = useMemo(() =>
        edges.map(edge => ({
            ...edge,
            style: {
                ...edge.style,
                stroke: selectedEdgesIds.has(edge.id) ? '#ff6b6b' : '#b1b1b7',
                strokeWidth: selectedEdgesIds.has(edge.id) ? 3 : 1,
            },
        })),
        [edges, selectedEdgesIds]);

    const onDeleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !selectedElements.nodes.some((n) => n.id === node.id)));

        const updates = selectedElements.edges.map((edge) => {
            const targetNode = nodes.find(node => node.id === edge.target);
            const targetHandle = edge.targetHandle?.split('-')[0];

            if (targetNode && targetHandle) {
                const setters = nodeStateManager.getFns(edge.target);
                if (setters) {
                    const isRequired = (targetNode.data as Component).arguments.find((arg: ArgumentType) => arg.name === targetHandle)?.required;
                    return { setters, targetHandle, isRequired };
                }
            }
            return null;
        }).filter(update => update !== null) as { setters: any, targetHandle: string, isRequired: boolean }[];

        setEdges((eds) => eds.filter((edge) => !selectedElements.edges.some((e) => e.id === edge.id)));

        setTimeout(() => {
            updates.forEach(({ setters, targetHandle, isRequired }) => {
                if (isRequired) {
                    setters.setCheckedArgs((prev: any) => ({ ...prev, [targetHandle]: true }));
                } else {
                    setters.setCheckedArgs((prev: any) => ({ ...prev, [targetHandle]: false }));
                }
                setters.setArgValues((prev: any) => ({ ...prev, [targetHandle]: '' }));
            });
        }, 0);
    }, [selectedElements, setNodes, setEdges, nodes]);

    const handleExport = useCallback(() => {
        const exportData: ExportedNode[] = nodes.map(node => {
            const nodeData = node.data as Component;
            const nodeState = nodeStateManager.getNodeState(node.id);

            if (!nodeState) return null;

            const { checkedArgs, argValues, blocks } = nodeState;

            const exportArgs = (args: ArgumentType[], checkedArgs: { [key: string]: boolean }, argValues: { [key: string]: { value: string; type: string } }): ExportedArgument[] => {
                return Object.entries(checkedArgs)
                    .filter(([_, isChecked]) => isChecked)
                    .map(([argName, _]) => ({
                        name: argName,
                        value: argValues[argName]?.value || ''
                    }));
            };

            const exportBlocks = (blocks: BlockType[], prefix: string): ExportedBlock[] => {
                return blocks.reduce((acc, block, index) => {
                    const blockId = `${prefix}.${block.name}${index}`;
                    const blockState = nodeStateManager.getNodeState(blockId);

                    if (!blockState) return acc;

                    const { checkedArgs: blockCheckedArgs, argValues: blockArgValues, isChecked, blocks: nestedBlocks } = blockState;

                    if (isChecked || block.required) {
                        acc.push({
                            name: block.name,
                            arguments: exportArgs(block.arguments, blockCheckedArgs, blockArgValues),
                            blocks: exportBlocks(nestedBlocks, blockId)
                        });
                    }

                    return acc;
                }, [] as ExportedBlock[]);
            };

            return {
                name: nodeData.name,
                label: nodeData.hasLabel ? nodeData.label : undefined,
                arguments: exportArgs(nodeData.arguments, checkedArgs, argValues),
                blocks: exportBlocks(blocks, node.id)
            };
        }).filter((node): node is ExportedNode => node !== null);

        const alloyConfig = marshallToAlloyConfig(exportData);
        exportToFile(alloyConfig)
    }, [nodes]);

    const toggleCategory = useCallback((category: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    }, []);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.name.endsWith('.alloy')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const content = e.target.result as string
                    const exportedNodes = unmarshallFromAlloyConfig(content);
                    const [nodes, edges] = buildGraph(exportedNodes, components)
                    setNodes((nds) => nodes);
                    setEdges((edg) => edges);
                }
            };
            reader.readAsText(file);
        } else {
            alert('Please select a valid .alloy file.');
        }
    };

    const layoutNode = () => {
        const layout = getLayoutedElements(nodes, edges)
        setNodes((nds) => layout.nodes);
        setEdges((edg) => layout.edges);
    }

    return (
        <div className={styles.container}>
            <div className={styles.componentPanel}>
                <h3>Components</h3>
                {Array.from(components.entries()).map(([category, componentMap]) => (
                    <div key={category} className={styles.categoryContainer}>
                        <div
                            className={styles.categoryHeader}
                            onClick={() => toggleCategory(category)}
                        >
                            {expandedCategories.has(category) ? '▼' : '▶'} {category}
                        </div>
                        {expandedCategories.has(category) && (
                            <div className={styles.componentList}>
                                {Array.from(componentMap.keys()).map(componentName => (
                                    <div
                                        key={componentName}
                                        className={styles.draggableItem}
                                        draggable
                                        onDragStart={(event) => {
                                            event.dataTransfer.setData('application/reactflow', `${category}|${componentName}`);
                                            event.dataTransfer.effectAllowed = 'move';
                                        }}
                                    >
                                        {componentName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.flowWrapper}>
                <button
                    className={styles.importButton}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    Import
                </button>
                <button
                    className={styles.layoutButton}
                    onClick={() => layoutNode()}
                >
                    Layout
                </button>
                <button
                    className={styles.exportButton}
                    onClick={handleExport}
                >
                    Export
                </button>
                <button
                    className={styles.deleteButton}
                    onClick={onDeleteSelected}
                    disabled={selectedElements.nodes.length === 0 && selectedElements.edges.length === 0}
                >
                    Delete Selected
                </button>
                <input
                    type="file"
                    id="file-input"
                    style={{ display: 'none' }}
                    accept=".alloy"
                    onChange={handleFileSelect}
                />
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={styledNodes}
                    edges={styledEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onSelectionChange={onSelectionChange}
                    selectNodesOnDrag={true}
                    className={styles.reactFlow}
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};

async function loadComponentsFromFile(): Promise<Map<string, Map<string, Component>>> {
    try {
        const response = await fetch('/components.json');
        if (!response.ok) {
            throw new Error('Failed to fetch components.json');
        }
        const componentsObject = await response.json();

        const componentsMap = new Map<string, Map<string, Component>>();

        for (const [outerKey, innerObject] of Object.entries(componentsObject)) {
            const innerMap = new Map<string, Component>();
            for (const [innerKey, component] of Object.entries(innerObject as Record<string, Component>)) {
                innerMap.set(innerKey, component as Component);
            }
            componentsMap.set(outerKey, innerMap);
        }

        return componentsMap;
    } catch (error) {
        console.error("Error loading components from file:", error);
        return new Map();
    }
}

const styles = {
    container: css`
        display: flex;
        width: 100%;
        height: 100%;
        overflow: hidden;
    `,
    componentPanel: css`
        width: 400px;
        padding: 15px;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
        overflow-y: auto;
        height: 100%;
    `,
    categoryContainer: css`
        margin-bottom: 10px;
    `,
    categoryHeader: css`
        cursor: pointer;
        font-weight: bold;
        padding: 5px;
        background-color: #e0e0e0;
        border-radius: 4px;
        &:hover {
            background-color: #d0d0d0;
        }
    `,
    componentList: css`
        margin-left: 15px;
    `,
    draggableItem: css`
        margin: 5px 0;
        padding: 8px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: move;
        &:hover {
            background-color: #e0e0e0;
        }
    `,
    flowWrapper: css`
        flex-grow: 1;
        position: relative;
        height: 100%;
    `,
    deleteButton: css`
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 4;
        padding: 8px 12px;
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
            background-color: #ff3333;
        }
        &:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    `,
    exportButton: css`
        position: absolute;
        top: 10px;
        right: 164px;
        z-index: 5;
        padding: 8px 12px;
        background-color: #FFA500;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
            background-color: #FF8C00;
        }
    `,
    importButton: css`
        position: absolute;
        top: 10px;
        right: 247px;
        z-index: 6;
        padding: 8px 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
            background-color: #0056b3;
        }
    `,
    layoutButton: css`
        position: absolute;
        top: 10px;
        right: 331px;
        z-index: 6;
        padding: 8px 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover {
            background-color: #0056b3;
        }
    `,
    selectedNode: css`
        box-shadow: 0 0 0 0px #ff6b6b;
    `,
    selectedEdge: css`
        stroke: #ff6b6b;
        stroke-width: 3;
    `,
    reactFlow: css`
        width: 100%;
        height: 100%;
    `,
};

export default VisualScriptingGraph;
