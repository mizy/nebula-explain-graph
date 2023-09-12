import VEditor from "@vesoft-inc/veditor";
import {
  VEditorData,
  VEditorNode,
  VEditorLine,
} from "@vesoft-inc/veditor/types/Model/Schema";
import { InstanceNode } from "@vesoft-inc/veditor/types/Shape/Node";
import { Utils } from "@vesoft-inc/veditor";
import ReactDOM from "react-dom";
import styles from "./Explain.module.less";
export type ExplainProfile = {
  rows: number;
  execDurationInUs: number;
  totalDurationInUs: number;
};

export type ExplainOutput =
  | {
      colNames: string[];
      type: string;
      name: string;
    }
  | string;

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
class ExplainPlugin {
  editor: VEditor;
  config: ExplainConfig;
  data?: VEditorData;

  constructor(editor: VEditor, config?: ExplainConfig) {
    this.editor = editor;
    this.config = config || {};
    this.init();
  }

  init() {
    this.registerShape();
    if (this.config.data) {
      this.setData(this.config.data);
    }
  }

  async setData(data: ExplainData) {
    this.data = this.convertData(data);
    await this.editor.schema.setInitData(this.data);
    this.editor.config.dagreOption = {
      rankdir: "BT",
      ranker: "tight-tree",
      ranksep: 100,
    };
    this.editor.schema.format();
    this.editor.controller.autoScale();
    this.editor.controller.autoFit();
  }

  convertData(data: ExplainData): VEditorData {
    const res: VEditorData = {
      nodes: [],
      lines: [],
    };
    data.forEach((item) => {
      const node: VEditorNode = {
        uuid: item.id.toString(),
        name: item.name,
        x: 0,
        y: 0,
        type: "explainNode",
        data: {
          ...item,
        },
      };
      res.nodes.push(node);
      item.dependencies?.forEach((id) => {
        const line: VEditorLine = {
          from: id.toString(),
          to: item.id.toString(),
          fromPoint: 2,
          toPoint: 3,
          type: "explainLine",
          data: {
            description: item.description,
          },
        };
        res.lines.push(line);
      });
    });
    return res;
  }

  registerShape() {
    this.editor.graph.node.registeNode(
      "explainNode",
      {
        render: (instanceNode: InstanceNode) => {
          const { data } = instanceNode;
          instanceNode.shape = instanceNode.shape
            ? instanceNode.shape
            : document.createElementNS("http://www.w3.org/2000/svg", "g");

          ReactDOM.render(
            <>
              <rect
                filter="url(#ve-black-shadow)"
                width={540}
                height={160}
                rx={20}
                ry={20}
                fill="#fff"
              />
              <foreignObject width={540} height={160} x={0} y={0}>
                {this.renderNode(data)}
              </foreignObject>
            </>,
            instanceNode.shape
          );
          return instanceNode.shape;
        },
      },
      "domNode"
    );
    // extend the polyline
    this.editor.graph.line.registeLine("explainLine", {}, "polyline");
  }

  renderNode(data: VEditorNode) {
    const { description, profiles, outputVar } = data.data as ExplainNode;
    return (
      <div className={styles.explainNode} data-name={data.name}>
        <div className={styles.header}>
          <div className="node-text">{data.name}</div>
        </div>
        <ul className={styles.body}>
          <li>
            <span className={styles.label}>outputVar:</span>
            {this.renderOutputVar(outputVar)}
          </li>
          <li>
            <span className={styles.label}>inputVar:</span>
            <span>{description?.[0].inputVar}</span>
          </li>
          {profiles ? (
            <li>
              <span className={styles.label}>totalTime:</span>
              <span>
                {this.renderSplitNum(
                  (profiles[0] as ExplainProfile).totalDurationInUs
                )}{" "}
                us
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    );
  }

  renderOutputVar(data: any) {
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    const res = [];
    // render each key of data
    for (const key in data) {
      res.push(
        <span className={styles.ouputLabel}>{key}:</span>,
        <span className={styles.ouputVal}> {JSON.stringify(data[key])}</span>
      );
    }
    return res;
  }

  renderSplitNum(num: number): string {
    const str = num.toString();
    const res: string[] = [];
    for (let i = str.length - 1; i >= 0; i--) {
      res.unshift(str[i]);
      if ((str.length - i) % 3 === 0 && i !== 0) {
        res.unshift(",");
      }
    }
    return res.join("");
  }

  caches: Record<string, DOMRect> = {};
  getSize(data: VEditorNode): DOMRect {
    if (!data.uuid) {
      return new DOMRect();
    }
    if (this.caches[data.uuid]) {
      return this.caches[data.uuid];
    }
    const dom = this.renderNode(data);
    this.caches[data.uuid] = Utils.dom.getDOMRect(dom);
    return this.caches[data.uuid];
  }
}
export default ExplainPlugin;
