import { ExportedNode, ExportedArgument, ExportedBlock } from "./types";

const tokenize = (input: string): string[] => {
    return input
        .replace(/\s*{\s*/g, ' { ')
        .replace(/\s*}\s*/g, ' } ')
        .replace(/\s*\[\s*/g, ' [ ')
        .replace(/\s*\]\s*/g, ' ] ')
        .split(/\s+/)
        .filter(token => token.length > 0);
};

const closingToken: { [key: string]: string } = {
    '{': '}',
    '[': ']',
    '"': '"',
    '`': '`'
  };
  

const parseArguments = (tokens: string[], index: number): [string, number] => {
    if (!(tokens[index] in closingToken)) {
        return [tokens[index],  index+1];
    }
    const startToken = tokens[index++]
    let tokenCount = 1
    const endToken = closingToken[startToken]
    let value = startToken
    while (index < tokens.length && tokenCount != 0) {
        if (tokens[index] == endToken) {
            tokenCount--
        } else if (tokens[index] == startToken) {
            tokenCount++
        }
        value += tokens[index++]
    }
    return [value, index];
};

const parseNodes = (tokens: string[]): ExportedNode[] => {
    const nodes: ExportedNode[] = [];
    let index = 0;
    while (index < tokens.length) {
        const name = tokens[index++];
        let label = undefined
        if (tokens[index] !== '{') {
            label = tokens[index++].slice(1, -1)
        }
        nextToken(tokens[index++], '{')
        const [args, blocks, newIndex] = parseBody(index, tokens)
        nodes.push({
            name,
            label,
            arguments: args,
            blocks
        });
        index = newIndex;
    }
    return nodes;
};

const parseBody = (index: number, tokens: string[]): [ExportedArgument[], ExportedBlock[], number] => {
    const args: ExportedArgument[] = [];
    const blocks: ExportedBlock[] = [];
    while (index < tokens.length && tokens[index] != '}') {
        const elName = tokens[index++]
        const symbol = tokens[index++]
        if (symbol === "=") {
            const [value, newIndex] = parseArguments(tokens, index);
            index = newIndex;
            args.push({name: elName, value})
        } else if (symbol === "{") {
            const [nestedArgs, nestedBlocks, newIndex] = parseBody(index, tokens);
            index = newIndex;
            blocks.push({arguments: nestedArgs, blocks: nestedBlocks, name: elName})
        } else {
            console.error("parsing error, verify that your config is correct")
        }
    }
    return [args, blocks, index+1]
}

function nextToken(value: string, expected: string) {
    if (value != expected) {
        console.error("parsing error, verify that your config is correct")
    }
}

export function unmarshallFromAlloyConfig(config: string): ExportedNode[] {
    const tokens = tokenize(config);
    return parseNodes(tokens);
}
