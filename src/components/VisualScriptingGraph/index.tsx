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
import { componentMap } from './components/fixtures';

import '@xyflow/react/dist/style.css';
import ComponentNode from './graph/ComponentNode';
import nodeStateManager from './graph/nodeStateManager';
import { Component, Argument as ArgumentType } from './components/types';
import { MarkdownComponentDataSource } from './components/markdown';

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

// dataSource was used to fetch the components and build the components.json file
//const dataSource = new MarkdownComponentDataSource("v1.2.1")
let components = new Map<string, Map<string, Component>>()

const VisualScriptingGraph = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedElements, setSelectedElements] = useState<OnSelectionChangeParams>({ nodes: [], edges: [] });

    const nodeTypes = useMemo(() => ({ componentNode: ComponentNode }), []);

    useEffect(() => {
        loadComponentsFromFile().then(loadedComponents => {
            components = loadedComponents;
            console.log(loadedComponents)
        });
    }, []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();
            const componentName = event.dataTransfer.getData('application/reactflow');

            const reactFlowBounds = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - reactFlowBounds.left;
            const y = event.clientY - reactFlowBounds.top;

            const position = { x, y };

            const component = structuredClone(componentMap[componentName])

            if (component.hasLabel) {
                component.label = generateRandomString(6)
            }

            const id = component.name + (component.hasLabel ? "." + component.label : "");

            const newNode: Node = {
                id: id,
                type: 'componentNode',
                position,
                data: component,
            };

            setNodes((nds) => nds.concat(newNode));
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
                const setters = nodeStateManager.getNodeSetters(edge.target);
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
        const exportData = nodes.map(node => {
            const nodeData = node.data as Component;
            const setters = nodeStateManager.getNodeSetters(node.id);
            
            let checkedArgs: { [key: string]: boolean } = {};
            let argValues: { [key: string]: string } = {};
            
            if (setters) {
                setters.setCheckedArgs(prev => {
                    checkedArgs = prev;
                    return prev;
                });
                setters.setArgValues(prev => {
                    argValues = prev;
                    return prev;
                });
            }
            
            return {
                name: nodeData.name,
                label: nodeData.hasLabel ? nodeData.label : undefined,
                arguments: Object.entries(checkedArgs)
                    .filter(([_, isChecked]) => isChecked)
                    .map(([argName, _]) => ({
                        name: argName,
                        value: argValues[argName] || ''
                    }))
            };
        });
    
        console.log('Exported Data:', exportData);
        // You can also save this data to a file or send it to a server
    }, [nodes]);

    return (
        <div className={styles.container}>
            <div className={styles.componentPanel}>
                <h3>Components</h3>
                {Object.entries(componentMap).map(([name, component]) => (
                    <div
                        key={name}
                        className={styles.draggableItem}
                        draggable
                        onDragStart={(event) => {
                            event.dataTransfer.setData('application/reactflow', name);
                            event.dataTransfer.effectAllowed = 'move';
                        }}
                    >
                        {name}
                    </div>
                ))}
            </div>
            <div className={styles.flowWrapper}>
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
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
};

// This function was used to fetch the components info from the doc
// async function loadData() {
//     try {
//         const data = await dataSource.getComponents();
//         components = data;

//         const componentsObject = Object.fromEntries(
//             Array.from(components.entries()).map(([key, value]) => [
//                 key,
//                 Object.fromEntries(value)
//             ])
//         );
//         const blob = new Blob([JSON.stringify(componentsObject, null, 2)], { type: 'application/json' });
//         const url = URL.createObjectURL(blob);

//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'components.json';
//         document.body.appendChild(a);
//         a.click();

//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);

//         console.log("Components saved to components.json and downloaded");
//     } catch (error) {
//         console.error("Error loading or saving components:", error);
//     }
// }

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
        height: 100vh;
    `,
    componentPanel: css`
        width: 200px;
        padding: 15px;
        background-color: #f0f0f0;
        border-right: 1px solid #ccc;
    `,
    draggableItem: css`
        margin: 10px 0;
        padding: 10px;
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
        right: 150px;
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
    selectedNode: css`
    box-shadow: 0 0 0 0px #ff6b6b;
`,
    selectedEdge: css`
    stroke: #ff6b6b;
    stroke-width: 3;
`,
};

export default VisualScriptingGraph;