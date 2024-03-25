import { VEditorData, VEditorNode } from "@vesoft-inc/veditor/types/Model/Schema";
import { VEditor } from "@vesoft-inc/veditor";
export declare const colors: string[];
export declare const pipelineColors: string[];
export type NodeData = (ExplainNode | OperatorStats) & {
    preamble: "explain" | "profile";
    rank: number;
};
export type ExplainNode = {
    columns: string;
    details: string;
    edgeTypeId: number;
    id: number;
    name: string;
    children?: number[];
};
export type ExplainData = {
    preamble?: 'explain' | 'profile';
    buildTimeInUs: number;
    optimizeTimeInUs: number;
    header: string[];
    planNodes?: ExplainNode[];
    operators?: ProfileStats;
};
export type ProfileStats = {
    startTimeMs: number;
    endTimeMs: number;
    durationMs: number;
    pipelines: PipelineStats[];
};
export type PipelineStats = {
    blockTimes: number;
    yieldTimes: number;
    consumerOperatorId: OperatorUniqueId;
    operators: OperatorStats[];
};
export type OperatorStats = {
    id: OperatorUniqueId;
    timeMs?: number;
    preamble?: 'explain' | 'profile';
    pipelineId: string;
    [key: string]: any;
};
export type OperatorUniqueId = {
    pipelineId: number;
    operatorId: number;
    planNodeId: number;
    inStorage: boolean;
};
export type ExplainConfig = {
    data?: ExplainData;
};
declare class ExplainPlugin {
    editor: VEditor;
    config: ExplainConfig;
    data?: VEditorData;
    totalTime: number;
    totalRows: number;
    pipelineColorMap: Record<string, string>;
    colorIndex: number;
    constructor(editor: VEditor, config?: ExplainConfig);
    init(): Promise<void>;
    setData(data: ExplainData): Promise<void>;
    getPipelineColor(): string;
    convertData(data: ExplainData): VEditorData;
    convertExplainData(data: ExplainData): VEditorData;
    convertProfileData(data: ExplainData): VEditorData;
    getOperatorId(id: OperatorUniqueId): string;
    registerShape(): void;
    getReverseColor(colorString: string): string;
    renderNode: (data: VEditorNode) => import("react/jsx-runtime").JSX.Element;
    renderOutputVar(data: any): any;
    renderSplitNum(num?: number): string;
    parseTimeToMs(time: string): number;
    caches: Record<string, DOMRect>;
    getSize(data: VEditorNode): DOMRect;
    initShadowFilter: (editor: VEditor) => void;
}
export default ExplainPlugin;
