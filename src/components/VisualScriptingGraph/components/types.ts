export type Component = {
    name: string;
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
    arguments: Argument[];
    blocks: Block[];
};
