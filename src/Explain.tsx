import VEditor from "@vesoft-inc/veditor";
import styles from "./Explain.module.less";
import { useEffect, useRef } from "react";
import ExplainPlugin, { ExplainData } from "./Shape";
import NgqlRender from "./GQL";
import copySVG from "./assets/copy.svg";
import copy from "copy-to-clipboard";

export interface ExplainProps {
  style?: React.CSSProperties;
  gql: string;
  data?: ExplainData;
}

function Explain(props: ExplainProps) {
  const editorRef = useRef<VEditor>();
  const explainPluginRef = useRef<ExplainPlugin>();
  const domRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const editor = new VEditor({
      dom: domRef.current!,
    });
    editorRef.current = editor;
    explainPluginRef.current = new ExplainPlugin(editor, {
      data: props.data,
    });
    return () => {
      editor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.data && explainPluginRef.current) {
      explainPluginRef.current?.setData(props.data);
    }
  }, [props.data]);

  return (
    <div className={styles.vesoftExplainGraph} style={props.style}>
      <div className={styles.gql}>
        <NgqlRender ngql={props.gql} />
        <div
          className={styles.copyButton}
          onClick={() => {
            copy(props.gql);
          }}
        >
          <img src={copySVG} alt="copy" />
        </div>
      </div>
      <div className="explain-graph">
        <div className="graph-area">
          <div className={styles.graphWrapper} ref={domRef}></div>
        </div>
        <div className="detail-area"></div>
      </div>
    </div>
  );
}
export default Explain;
