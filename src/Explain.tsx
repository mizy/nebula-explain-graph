import { VEditor } from "@vesoft-inc/veditor";
import styles from "./Explain.module.less";
import { useCallback, useEffect, useRef, useState } from "react";
import ExplainPlugin, {
  ExplainData,
  ExplainNode,
  NodeData,
  OperatorStats,
} from "./Shape";
import NgqlRender from "./GQL";
import copySVG from "./assets/copy.svg";
import plusSVG from "./assets/plus.svg";
import minusSVG from "./assets/minus.svg";
import sortSVG from "./assets/sort.svg";
import closeSVG from "./assets/close.svg";
import copy from "copy-to-clipboard";
import { Button, message } from "antd";
import React from "react";
import { VEditorNode } from "@vesoft-inc/veditor/types/Model/Schema";
import { InstanceNode } from '@vesoft-inc/veditor/types/Shape/Node';

export interface ExplainProps {
  style?: React.CSSProperties;
  gql?: string;
  data?: ExplainData;
  detailWidth?: number;
}
const updatePanAnimation = (editor: VEditor, node: InstanceNode) => {
  setTimeout(() => {
    editor.paper.style.transition = "all 0.2s";
    const { width, height } =  editor.dom.getBoundingClientRect();
    const x =  - (node.data!.x as number) - (node.shapeBBox!.width as number) / 2;
    const y =  - (node.data!.y as number) - (node.shapeBBox!.height as number) / 2;
    // const scale = editor.controller.scale;
    editor.controller.scale = 0.5;
    editor.controller.moveTo(x*0.5+width / 2, y*0.5+height / 2);
    editor.graph.update();
    setTimeout(() => {
      editor.paper.style.transition = "";
    }, 200);
  }, 201);
};
function Explain(props: ExplainProps) {
  const { detailWidth = 400 } = props;
  const editorRef = useRef<VEditor>();
  const explainPluginRef = useRef<ExplainPlugin>();
  const domRef = useRef<HTMLDivElement>(null);
  const zoomFrame = useRef<number>();
  const [activeNode, setActiveNode] = useState<ExplainNode | undefined>();
  const activeRef = useRef<ExplainNode | undefined>();
  const [legendNodes, setLegendNodes] = useState<VEditorNode[]>([]);
  useEffect(() => {
    const editor = new VEditor({
      dom: domRef.current!,
      mode: "view",
      showBackGrid: false,
    });
    editorRef.current = editor;
    explainPluginRef.current = new ExplainPlugin(editor, {
      data: props.data,
    });

    editor.graph.on("node:click", ({ node }: any) => {
      setActiveNode(node.data.data as any);
      activeRef.current = node.data.data as any;
    });
    editor.graph.on("paper:click", () => {
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
      const nodes = explainPluginRef.current?.data?.nodes;
      setLegendNodes(nodes || []);
    }
  }, [props.data]);

  const onChangeLayoutSort = async () => {
    const editor = editorRef.current as VEditor;
    editor.config.dagreOption = {
      // ...editor.config.dagreOption,
      rankdir: editor.config.dagreOption?.rankdir === "TB" ? "BT" : "TB",
      ranksep: 150,
      align:undefined,
      ranker: "tight-tree",
    };
    const isRevert = editor.config.dagreOption?.rankdir === "TB";
    for (const key in editor.graph.line.lines) {
      const line = editor.graph.line.lines[key];
      line.data.fromPoint = isRevert ? 3 : 2;
      line.data.toPoint = isRevert ? 2 : 3;
    }
    await editor.schema.format();
    editor.controller.autoFit();
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

  const focusNode = (node: VEditorNode) => {
    const editor = editorRef.current as VEditor;
    const instanceNode = editor.graph.node.nodes[node.uuid!];
    editor.graph.node.unActive();
    editor.graph.node.setActive(instanceNode);
    setActiveNode(node.data! as ExplainNode);
    updatePanAnimation(editor, instanceNode);
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
      <div
        className={styles.explainGraph}
        style={{
          height: props.gql ? "calc(100% - 40px)" : "100%",
        }}
      >
        <div className={styles.graphArea}>
          <div className={styles.graphWrapper} ref={domRef}></div>
          <div className={styles.buttonArea}>
            <Button onMouseDown={zoomIn}>
              <img src={plusSVG} style={{ paddingTop: 3 }} alt="plus" />
            </Button>
            <Button onMouseDown={zoomOut}>
              <img src={minusSVG} style={{ paddingTop: 3 }} alt="minus" />
            </Button>
            <Button onClick={onChangeLayoutSort}>
              <img src={sortSVG} alt="sort" />
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
            <div className={styles.detailTitle}>
              <span>{activeNode?.name}</span>
              <img
                src={closeSVG}
                alt="close"
                onClick={() => {
                  setActiveNode(undefined);
                }} />
            </div>
            <div className={styles.detailInfo}>
              {activeNode&&Object.keys(activeNode).map((key) => {
                return (
                  <React.Fragment key={key}>
                    <span key={key} title={key} className={styles.detailLabel}>
                      {key}:
                    </span>
                    <pre key={key + "val"} className={styles.detailValue}>
                      {renderVal((activeNode as any)[key])}
                    </pre>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles.rankArea}>
          <div className={styles.rankTitle}>TotalTime</div>
          {legendNodes?.map((item) => {
            const node = item.data as NodeData;
            return (
              <div
                key={item.uuid}
                onClick={() => {
                  focusNode(item);
                }}
                className={
                  styles.rankItem +
                  `${activeNode?.id === node.id ? ` ${styles.active}` : ""}`
                }
              >
                {node.rank!==undefined &&
                  <span
                    style={{
                      background: "#00BFA5"
                    }}
                  >{node.rank + 1}</span>}
                {node.name}
              </div>
            );
          })}
        </div>
        {Object.keys(explainPluginRef.current?.pipelineColorMap||{}).length > 0 && (
          <div className={styles.pipeline}>
            <div className={styles.rankTitle}>Pipeline:</div>
            {Object.keys(explainPluginRef.current?.pipelineColorMap || {}).map((key) => {
              const color = explainPluginRef.current?.pipelineColorMap[key];
              return (
                <div
                  key={key}
                  className={styles.rankItem}
                >
                  <span style={{ background: color }}></span>
                  {key}
                </div>
              );
            })}
          </div>)}
        </div>
    </div>
  );
}
 
export default Explain;