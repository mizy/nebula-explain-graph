import { VEditor } from "@vesoft-inc/veditor";
import styles from "./Explain.module.less";
import { useCallback, useEffect, useRef, useState } from "react";
import ExplainPlugin, { ExplainData, ExplainNode } from "./Shape";
import NgqlRender from "./GQL";
import copySVG from "./assets/copy.svg";
import plusSVG from "./assets/plus.svg";
import minusSVG from "./assets/minus.svg";
import sortSVG from "./assets/sort.svg";
import copy from "copy-to-clipboard";
import { Button, message } from "antd";
const updatePanAnimation = (editor: VEditor) => {
  setTimeout(() => {
    editor.controller.autoScale();
    editor.controller.autoFit();
  }, 200);
};
export interface ExplainProps {
  style?: React.CSSProperties;
  gql?: string;
  data?: ExplainData;
  detailWidth?: number;
}
function Explain(props: ExplainProps) {
  const { detailWidth = 400 } = props;
  const editorRef = useRef<VEditor>();
  const explainPluginRef = useRef<ExplainPlugin>();
  const domRef = useRef<HTMLDivElement>(null);
  const zoomFrame = useRef<number>();
  const [activeNode, setActiveNode] = useState<ExplainNode | undefined>();
  const activeRef = useRef<ExplainNode | undefined>();
  useEffect(() => {
    const editor = new VEditor({
      dom: domRef.current!,
    });
    editorRef.current = editor;
    explainPluginRef.current = new ExplainPlugin(editor, {
      data: props.data,
    });
    editor.graph.on("node:click", ({ node }: any) => {
      !activeRef.current && updatePanAnimation(editor);
      setActiveNode(node.data.data as any);
      activeRef.current = node.data.data as any;
    });
    editor.graph.on("paper:click", () => {
      activeRef.current && updatePanAnimation(editor);
      setActiveNode(undefined);
      activeRef.current = undefined;
    });
    return () => {
      editor.destroy();
    };
  }, []);

  useEffect(() => {
    if (props.data && explainPluginRef.current) {
      explainPluginRef.current?.setData(props.data);
    }
  }, [props.data]);

  const onChangeLayoutSort = () => {
    const editor = editorRef.current as VEditor;
    editor.config.dagreOption = {
      ...editor.config.dagreOption,
      rankdir: editor.config.dagreOption?.rankdir === "TB" ? "BT" : "TB",
    };
    const isRevert = editor.config.dagreOption?.rankdir === "TB";
    for (const key in editor.graph.line.lines) {
      const line = editor.graph.line.lines[key];
      line.data.fromPoint = isRevert ? 3 : 2;
      line.data.toPoint = isRevert ? 2 : 3;
    }
    editor.schema.format();
  };

  const zoomOut = useCallback(() => {
    if (zoomFrame.current === undefined) {
      document.addEventListener("mouseup", zoomMouseUp);
    }
    const rect = domRef.current?.getBoundingClientRect() as any;
    (editorRef.current as VEditor).controller.zoom(
      0.97,
      rect?.width / 2,
      rect?.height / 2
    );
    zoomFrame.current = requestAnimationFrame(() => {
      zoomOut();
    });
  }, []);

  const zoomIn = useCallback(() => {
    if (zoomFrame.current === undefined) {
      document.addEventListener("mouseup", zoomMouseUp);
    }
    const rect = domRef.current?.getBoundingClientRect() as any;
    (editorRef.current as VEditor).controller.zoom(
      1.03,
      rect?.width / 2,
      rect?.height / 2
    );
    zoomFrame.current = requestAnimationFrame(() => {
      zoomIn();
    });
  }, []);
  const zoomMouseUp = useCallback(() => {
    console.log("mouseup");
    cancelAnimationFrame(zoomFrame.current as number);
    zoomFrame.current = undefined;
    document.removeEventListener("mouseup", zoomMouseUp);
  }, []);

  const renderVal = (val: any) => {
    if (typeof val === "string") {
      try {
        const obj = JSON.parse(val);
        return JSON.stringify(obj, null, 2);
      } catch (e) {
        return val;
      }
    }
    if (typeof val === "object") {
      for (const key in val) {
        try {
          val[key] = JSON.parse(val[key]);
        } catch (e) {
          val[key];
        }
      }
    }
    return JSON.stringify(val, null, 2);
  };

  return (
    <div className={styles.vesoftExplainGraph} style={props.style}>
      {props.gql && (
        <div className={styles.gql}>
          <NgqlRender ngql={props.gql} />
          <div
            className={styles.copyButton}
            onClick={() => {
              copy(props.gql || "");
              message.success("success");
            }}
          >
            <img src={copySVG} alt="copy" />
          </div>
        </div>
      )}
      <div className={styles.explainGraph} style={{
        height: props.gql ? "calc(100% - 40px)" : "100%"
      }}>
        <div className={styles.graphArea}>
          <div className={styles.graphWrapper} ref={domRef}></div>
          <div className={styles.buttonArea}>
            <Button onMouseDown={zoomOut}>
              <img src={plusSVG} style={{ paddingTop: 3 }} alt="plus" />
            </Button>
            <Button onMouseDown={zoomIn}>
              <img src={minusSVG} style={{ paddingTop: 3 }} alt="plus" />
            </Button>
            <Button onClick={onChangeLayoutSort}>
              <img src={sortSVG} alt="plus" />
            </Button>
          </div>
        </div>
        <div
          className={styles.detailArea}
          style={{
            width: activeNode ? detailWidth : 0,
          }}
        >
          <div className={styles.detailContent} style={{ width: detailWidth }}>
            <div className={styles.detailTitle}>{activeNode?.name}</div>
            <div className={styles.detailPTitle}>Profiling data</div>
            <div className={styles.detailInfo}>
              {activeNode?.profiles?.map((profile) => {
                return Object.keys(profile).map((key) => {
                  return (
                    <>
                      <span title={key} className={styles.detailLabel}>
                        {key}:
                      </span>
                      <pre className={styles.detailValue}>
                        {renderVal(profile[key])}
                      </pre>
                    </>
                  );
                });
              })}
            </div>
            <div className={styles.detailPTitle}>Operator info</div>
            <div className={styles.detailInfo}>
              <span className={styles.detailLabel}>outputVar:</span>
              <pre className={styles.detailValue}>
                {renderVal(activeNode?.outputVar)}
              </pre>
              {activeNode?.description?.map((description) => {
                return Object.keys(description).map((key) => {
                  return (
                    <>
                      <span title={key} className={styles.detailLabel}>
                        {key}:
                      </span>
                      <pre className={styles.detailValue}>
                        {renderVal(description[key])}
                      </pre>
                    </>
                  );
                });
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Explain;
