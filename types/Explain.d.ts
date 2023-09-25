import { ExplainData, ExplainNode, ExplainOperator } from "./Shape";
import React from "react";
export interface ExplainProps {
    style?: React.CSSProperties;
    gql?: string;
    data?: ExplainData;
    detailWidth?: number;
    type?: "explain" | "profile";
}
declare function Explain(props: ExplainProps): import("react/jsx-runtime").JSX.Element;
declare function convertExplainData(data: {
    id: number;
    name: string;
    "operator info": string;
    "profiling data": string;
    dependencies: string;
}): ExplainNode;
declare function formatExplainData(data: string): ExplainOperator;
declare const convertedDashboardData: (data: any[]) => ExplainNode[];
export default Explain;
export { convertExplainData, formatExplainData, convertedDashboardData };
