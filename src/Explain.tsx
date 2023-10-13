import { VEditor } from "@vesoft-inc/veditor";
import styles from "./Explain.module.less";
import { useCallback, useEffect, useRef, useState } from "react";
import ExplainPlugin, {
  ExplainData,
  ExplainNode,
  ExplainOperator,
} from "./Shape";
import NgqlRender from "./GQL";
import copySVG from "./assets/copy.svg";
import plusSVG from "./assets/plus.svg";
import minusSVG from "./assets/minus.svg";
import sortSVG from "./assets/sort.svg";
import copy from "copy-to-clipboard";
import { Button, message } from "antd";
import React from "react";
const updatePanAnimation = (editor: VEditor) => {
  setTimeout(() => {
    editor.paper.style.transition = "all 0.2s";
    const { width } = editor.dom.getBoundingClientRect();
    const bbox = editor.paper.getBBox();
    const scale = editor.controller.scale;
    editor.controller.x = (width - bbox.width * scale) / 2 - bbox.x * scale;
    editor.controller.update();
    editor.graph.update();
    setTimeout(() => {
      editor.paper.style.transition = "";
    }, 200);
  }, 201);
};
export interface ExplainProps {
  style?: React.CSSProperties;
  gql?: string;
  data?: ExplainData;
  detailWidth?: number;
  type?: "explain" | "profile";
}
function Explain(props: ExplainProps) {
  const { detailWidth = 400, type = "profile" } = props;
  const editorRef = useRef<VEditor>();
  const explainPluginRef = useRef<ExplainPlugin>();
  const domRef = useRef<HTMLDivElement>(null);
  const zoomFrame = useRef<number>();
  const [activeNode, setActiveNode] = useState<ExplainNode | undefined>();
  const activeRef = useRef<ExplainNode | undefined>();
  useEffect(() => {
    const editor = new VEditor({
      dom: domRef.current!,
      mode: "view",
    });
    editorRef.current = editor;
    explainPluginRef.current = new ExplainPlugin(editor, {
      type,
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
            <div className={styles.detailTitle}>{activeNode?.name}</div>
            <div className={styles.detailPTitle}>Profiling data</div>
            <div className={styles.detailInfo}>
              {Object.keys(activeNode?.profilingData || {}).map((key) => {
                return (
                  <React.Fragment key={key}>
                    <span key={key} title={key} className={styles.detailLabel}>
                      {key}:
                    </span>
                    <pre key={key + "val"} className={styles.detailValue}>
                      {renderVal(activeNode?.profilingData?.[key])}
                    </pre>
                  </React.Fragment>
                );
              })}
            </div>
            <div className={styles.detailPTitle}>Operator info</div>
            <div className={styles.detailInfo}>
              {Object.keys(activeNode?.operatorInfo || {}).map((key) => {
                return (
                  <React.Fragment key={key}>
                    <span key={key} title={key} className={styles.detailLabel}>
                      {key}:
                    </span>
                    <pre key={key + "val"} className={styles.detailValue}>
                      {renderVal(activeNode?.operatorInfo[key])}
                    </pre>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function convertExplainData(data: {
  id: number;
  name: string;
  "operator info": string;
  "profiling data": string;
  dependencies: string;
}): ExplainNode {
  const operatorInfo = formatExplainData(data["operator info"]);
  const profilingData = safeParse(data["profiling data"]);
  if (typeof profilingData === "object") {
    profilingData.totalTime = Number(
      profilingData.totalTime.replace("(us)", "")
    );
    profilingData.execTime = Number(profilingData.execTime.replace("(us)", ""));
  }
  return {
    id: data.id,
    name: data.name,
    dependencies: data.dependencies
      ? data.dependencies.split(",").map((each) => Number(each))
      : [],
    profilingData,
    operatorInfo,
  };
}

function formatExplainData(data: string): ExplainOperator {
  const regex = /(\w+): ([\s\S]*?)(?=\n\w+:|$)/g;
  let match;
  const result: {
    [key: string]: string;
  } = {};

  while ((match = regex.exec(data)) !== null) {
    result[match[1]] = match[2].trim();
  }
  return result;
}

function safeParse(str: string) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

const convertedDashboardData = (data: any[]): ExplainNode[] => {
  return data.map((each) => {
    const profile = each.profiles?.[0] as any;
    if (profile) {
      if (profile.totalDurationInUs) {
        profile.totalTime = profile.totalDurationInUs;
      }
      if (profile.execDurationInUs) {
        profile.execTime = profile.execDurationInUs;
      }
    }

    return {
      id: each.id,
      name: each.name,
      dependencies: each.dependencies,
      profilingData: profile,
      branchInfo: each.branchInfo,
      operatorInfo: {
        outputVar: each.outputVar,
        ...(each.description?.reduce((acc: any, cur: any) => {
          return {
            ...acc,
            ...cur,
          };
        }, {}) as any),
      },
    };
  });
};
export default Explain;
export { convertExplainData, formatExplainData, convertedDashboardData };
