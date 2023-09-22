import { VEditorData, VEditorNode } from "@vesoft-inc/veditor/types/Model/Schema";
import { VEditor } from "@vesoft-inc/veditor";
export type ExplainProfile = {
    rows: number;
    execDurationInUs: number;
    totalDurationInUs: number;
    [key: string]: any;
};
export type ExplainOutput = {
    colNames: string[];
    type: string;
    name: string;
} | string;
export type ExplainDescription = Record<string, any>[];
export type ExplainNode = {
    id: number;
    name: string;
    profiles?: ExplainProfile[];
    outputVar: ExplainOutput;
    dependencies?: number[];
    description?: ExplainDescription;
};
export type ExplainData = ExplainNode[];
export type ExplainConfig = {
    data?: ExplainData;
};
declare class ExplainPlugin {
    editor: VEditor;
    config: ExplainConfig;
    data?: VEditorData;
    totalTime: number;
    totalRows: number;
    constructor(editor: VEditor, config?: ExplainConfig);
    init(): void;
    setData(data: ExplainData): Promise<void>;
    convertData(data: ExplainData): VEditorData;
    registerShape(): void;
    renderNode(data: VEditorNode): import("react/jsx-runtime").JSX.Element;
    renderOutputVar(data: any): any;
    renderSplitNum(num: number): string;
    caches: Record<string, DOMRect>;
    getSize(data: VEditorNode): DOMRect;
    initShadowFilter: (svg: SVGElement) => void;
}
export default ExplainPlugin;
