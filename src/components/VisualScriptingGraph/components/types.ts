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
    arguments: Argument[];
    blocks: Block[];
};
