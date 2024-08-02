import { Component } from './types';

const componentArray: Component[] = [
    {
        name: "prometheus.scrape",
        doc: "This is the first example component",
        hasLabel: true,
        arguments: [
            { name: "arg1", type: "string", doc: "A sample argument", required: true, default: "defaultValue1" },
            { name: "arg2", type: "string", doc: "A sample argument", required: false, default: "" }
        ],
        exports: [
            { name: "export1", type: "string", doc: "A sample export" }
        ],
        blocks: []
    },
    {
        name: "prometheus.remote_write",
        doc: "This is the second example component",
        hasLabel: true,
        arguments: [
            { name: "arg2", type: "number", doc: "Another sample argument", required: false, default: 42 }
        ],
        exports: [
            { name: "export2", type: "number", doc: "Another sample export" }
        ],
        blocks: []
    }
];

export const componentMap: Record<string, Component> = componentArray.reduce((acc, component) => {
    acc[component.name] = component;
    return acc;
}, {} as Record<string, Component>);
