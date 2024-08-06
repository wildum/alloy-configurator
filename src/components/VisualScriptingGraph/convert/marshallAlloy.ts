import { ExportedNode, ExportedArgument, ExportedBlock } from "./types";

export function marshallToAlloyConfig(exportedData: ExportedNode[]): string {
    const INDENTATION = '    ';

    const formatArguments = (args: ExportedArgument[], indentLevel: number): string => {
        const indent = INDENTATION.repeat(indentLevel);
        return args.map(arg => `${indent}${arg.name} = ${arg.value}`).join('\n');
    };

    const formatBlocks = (blocks: ExportedBlock[], prefix: string, indentLevel: number): string => {
        const indent = INDENTATION.repeat(indentLevel);
        const formattedBlocks = blocks
            .map(block => {
                const blockId = `${prefix}.${block.name}`;
                const blockArguments = formatArguments(block.arguments, indentLevel + 1);
                const nestedBlocks = formatBlocks(block.blocks, blockId, indentLevel + 1);

                const blockContent = [blockArguments, nestedBlocks]
                    .filter(content => content.length > 0)
                    .join('\n');

                return blockContent.length > 0 
                    ? `${indent}${block.name} {\n${blockContent}\n${indent}}` 
                    : `${indent}${block.name} {${indent}}`;
            });

        return formattedBlocks.join('\n');
    };

    const formatNode = (node: ExportedNode): string => {
        const { name, label, arguments: args, blocks } = node;
        const nodeLabel = label ? ` "${label}"` : '';
        const nodeArguments = formatArguments(args, 1);
        const nodeBlocks = formatBlocks(blocks, name, 1);

        const argsContent = nodeArguments.length > 0 ? `\n${nodeArguments}` : ""
        const blockContent = nodeBlocks.length > 0 ? `\n${nodeBlocks}` : ""

        return `${name}${nodeLabel} {${argsContent}${blockContent}\n}`;
    };

    return exportedData.map(formatNode).join('\n');
}
