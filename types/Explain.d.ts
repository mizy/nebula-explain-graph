import { ExplainData } from "./Shape";
import React from "react";
export interface ExplainProps {
    style?: React.CSSProperties;
    gql?: string;
    data?: ExplainData;
    detailWidth?: number;
}
declare function Explain(props: ExplainProps): import("react/jsx-runtime").JSX.Element;
export default Explain;
