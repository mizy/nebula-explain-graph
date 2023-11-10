import { VEditorData, VEditorNode } from "@vesoft-inc/veditor/types/Model/Schema";
import { VEditor } from "@vesoft-inc/veditor";
export type ExplainProfile = {
    rows: number;
    execTime: number;
    totalTime: number;
    rank?: number;
    [key: string]: any;
};
export declare const colors: string[];
export type ExplainOutput = {
    colNames: string[];
    type: string;
    name: string;
} | string;
export type ExplainOperator = {
    outputVar?: ExplainOutput;
    [key: string]: any;
};
export type ExplainNode = {
    id: number;
    name: string;
    profilingData: ExplainProfile;
    operatorInfo: ExplainOperator;
    dependencies?: number[];
    branchInfo?: BranchInfo;
};
export type BranchInfo = {
    conditionNodeId?: number;
    isDoBranch?: boolean;
};
export type ExplainData = ExplainNode[];
export type ExplainConfig = {
    data?: ExplainData;
    type?: "explain" | "profile";
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
    renderNode: (data: VEditorNode) => import("react/jsx-runtime").JSX.Element;
    renderOutputVar(data: any): any;
    renderSplitNum(num: number): string;
    caches: Record<string, DOMRect>;
    getSize(data: VEditorNode): DOMRect;
    initShadowFilter: (svg: SVGElement) => void;
}
export default ExplainPlugin;
