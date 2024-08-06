export type ExportedArgument = {
    name: string;
    value: string;
};

export type ExportedBlock = {
    name: string;
    arguments: ExportedArgument[];
    blocks: ExportedBlock[];
};

export type ExportedNode = {
    name: string;
    label: string | undefined;
    arguments: ExportedArgument[];
    blocks: ExportedBlock[];
};