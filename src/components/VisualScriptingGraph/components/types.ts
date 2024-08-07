export type Component = {
    name: string;
    label?: string;
    doc: string;
    hasLabel: boolean;
    arguments: Argument[];
    exports: Export[];
    blocks: Block[];
};

export type Argument = {
    name: string;
    type: string;
    doc: string;
    setOnLoad: boolean;
    required: boolean;
    default: any;
};

export type Export = {
    name: string;
    type: string;
    doc: string;
};

export type Block = {
    name: string;
    doc: string;
    required: boolean;
    setOnLoad: boolean;
    unique: boolean;
    arguments: Argument[];
    blocks: Block[];
};

const normalizeType = (type: string) => {
    const term = type.split(' or ')[0]
    return term === "string" || term === "secret" ? "string" : term
};

export function compareTypes(sourceType: string, targetType: string) {
    return normalizeType(sourceType) === normalizeType(targetType);
};
