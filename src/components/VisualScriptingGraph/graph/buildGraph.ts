import { ExportedNode, ExportedBlock, ExportedArgument } from "../convert/types";
import { Node, Edge } from '@xyflow/react';
import { Component, Block, Argument } from "../components/types";
import Dagre from '@dagrejs/dagre';

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({});

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        }),
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

function searchInChildren(parentMap: Map<string, Map<string, Component>>, searchKey: string): Component | undefined {
    let foundComponent: Component | undefined = undefined;
  
    parentMap.forEach((childMap, parentKey) => {
      if (childMap.has(searchKey)) {
        foundComponent = childMap.get(searchKey);
      }
    });
  
    return foundComponent;
  }

  const mapBlocks = (exportedBlocks: ExportedBlock[], componentBlocks: Block[]): Block[] => {
    return componentBlocks.map(componentBlock => {
      const exportedBlock = exportedBlocks.find(b => b.name === componentBlock.name);
      if (exportedBlock === undefined) {
        return componentBlock;
      }

      // TODO: check the block
      
      componentBlock.arguments.forEach(arg => {
        exportedBlock.arguments.forEach((exportedArg: ExportedArgument) => {
          if (arg.name === exportedArg.name) {
            arg.default = exportedArg.value;
          }
        });
      });
      
      componentBlock.blocks = mapBlocks(exportedBlock.blocks, componentBlock.blocks);
      
      return componentBlock;
    }).filter((block): block is Block => block !== null && block !== undefined);
  };

const buildNodes = (exportedNodes: ExportedNode[], components: Map<string, Map<string, Component>>): Node[] => {
    const position = { x: 0, y: 0 };

    const nodes = exportedNodes.map(exportedNode => {
        const component = searchInChildren(components, exportedNode.name);
        if (component === undefined) {
          return undefined;
        }
        let copy = structuredClone(component);
        copy.name = exportedNode.name;
        copy.label = exportedNode.label;
        
        exportedNode.arguments.forEach(arg => {
          copy.arguments.forEach((copyArg: Argument) => {
            if (arg.name === copyArg.name) {
              copyArg.default = arg.value;
            }
          });
        });
        
        copy.blocks = mapBlocks(exportedNode.blocks, copy.blocks);
        const id = copy.name + (copy.hasLabel ? "." + copy.label : "");
        
        const newNode: Node =  {
            id: id,
            type: 'componentNode',
            position,
            data: copy,
        };
        return newNode
      }).filter((node): node is Node => node !== null);

    return nodes
}

function buildEdges(nodes: Node[]): Edge[] {
    const edges: Edge[] = [];
    const exportMap = new Map<string, Node>();
    let edgeCount = 0;

    nodes.forEach(node => {
        (node.data as Component).exports.forEach(exp => {
            exportMap.set(`${node.id}.${exp.name}`, node);
        });
    });

    function checkArgumentsAndBlocks(component: Component, block: Block | Component, parentPath: string) {
        block.arguments.forEach(arg => {
            if (typeof arg.default === 'string') {
                Array.from(exportMap.keys()).forEach(exportKey => {
                    if (arg.default.includes(exportKey)) {
                        const exportNode = exportMap.get(exportKey);
                        const exportParts = exportKey.split('.')
                        if (exportNode) {
                            edges.push({
                                id: `${edgeCount++}`,
                                source: exportNode.id,
                                sourceHandle: `${exportNode.id}.${exportParts[exportParts.length-1]}-sourceRight`,
                                target: component.name + (component.hasLabel ? `.${component.label}` : ""),
                                targetHandle: `${parentPath}.${arg.name}-targetLeft`,
                            });
                        }
                    }
                });
            }
        });
        block.blocks.forEach(nestedBlock => {
            checkArgumentsAndBlocks(component, nestedBlock, `${parentPath}.${nestedBlock.name}`);
        });
    }

    nodes.forEach(node => {
        checkArgumentsAndBlocks(node.data as Component, node.data as Component, node.id);
    });

    return edges;
}

export function buildGraph(exportedNodes: ExportedNode[], components: Map<string, Map<string, Component>>): [Node[], Edge[]] {
    const nodes = buildNodes(exportedNodes, components)
    const edges = buildEdges(nodes)
    const layout = getLayoutedElements(nodes, edges)

    return [layout.nodes, layout.edges]
}