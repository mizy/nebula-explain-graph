/// <reference types="react" />
import { ExplainData } from "./Shape";
export interface ExplainProps {
    style?: React.CSSProperties;
    gql?: string;
    data?: ExplainData;
    detailWidth?: number;
}
declare function Explain(props: ExplainProps): import("react/jsx-runtime").JSX.Element;
export default Explain;
