import {
  VEditorData,
  VEditorNode,
  VEditorLine,
} from "@vesoft-inc/veditor/types/Model/Schema";
import { InstanceNode } from "@vesoft-inc/veditor/types/Shape/Node";
import { Utils, VEditor } from "@vesoft-inc/veditor";
import ReactDOM from "react-dom";
import styles from "./Explain.module.less";
import { InstanceLine } from "@vesoft-inc/veditor/types/Shape/Line";
import { AnyMap } from "@vesoft-inc/veditor/types/Utils";
import { mat2d } from "gl-matrix";

export type ExplainProfile = {
  rows: number;
  execTime: number;
  totalTime: number;
  rank?: number;
  [key: string]: any;
};

export type ExplainOutput =
  | {
      colNames: string[];
      type: string;
      name: string;
    }
  | string;

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
class ExplainPlugin {
  editor: VEditor;
  config: ExplainConfig;
  data?: VEditorData;
  totalTime = 0;
  totalRows = 0;

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
      ranker: "longest-path",
      ranksep: this.config.type === "explain" ? 100 : 200,
    };
    await this.editor.schema.format();
    this.editor.controller.autoScale();
    this.editor.controller.autoFit();
  }

  convertData(data: ExplainData): VEditorData {
    const res: VEditorData = {
      nodes: [],
      lines: [],
    };
    let totalTime = 0;
    let totalRows = 0;
    const do_lines: any[] = [];
    const dag_map: any = {};
    data.forEach((item) => {
      const node: VEditorNode = {
        uuid: item.id.toString(),
        name: item.name + "_" + item.id,
        x: 0,
        y: 0,
        type: "explainNode",
        data: {
          ...item,
        },
      };
      totalTime += item.profilingData?.totalTime || 0;
      totalRows += item.profilingData?.rows || 0;
      res.nodes.push(node);
      item.dependencies?.forEach((id) => {
        const line: VEditorLine = {
          from: id.toString(),
          to: item.id.toString(),
          fromPoint: 2,
          toPoint: 3,
          type: "explainLine",
          data: {
            rows: item.profilingData.rows,
          },
        };
        res.lines.push(line);
        dag_map[line.to] = {
          ...(dag_map[line.to] || {}),
          [line.from]: true,
        };
      });
      if (item.branchInfo) {
        if (item.branchInfo.conditionNodeId) {
          const line: VEditorLine = {
            to: item.branchInfo.conditionNodeId.toString(),
            from: item.id.toString(),
            fromPoint: 1,
            toPoint: 1,
            type: "explainLine",
            data: {
              isLoop: true,
            },
          };
          res.lines.push(line);
          dag_map[line.to] = {
            ...(dag_map[line.to] || {}),
            [line.from]: true,
          };
          if (item.branchInfo.isDoBranch) {
            do_lines.push({
              from: item.branchInfo.conditionNodeId.toString(),
              to: item.id.toString(),
            });
          }
        }
      }
    });
    // add do branch
    do_lines.forEach((line) => {
      let now = line.to;
      while (dag_map[now]) {
        now = Object.keys(dag_map[now])[0];
      }
      res.lines.push({
        from: line.from,
        to: now.toString(),
        fromPoint: 2,
        toPoint: 3,
        type: "explainLine",
        data: {
          isDo: true,
          isLoop: true,
        },
      });
    });
    // sort by item.profilingData?.totalTime
    res.nodes.sort((a, b) => {
      const aTime = (a.data as ExplainNode).profilingData?.totalTime || -1;
      const bTime = (b.data as ExplainNode).profilingData?.totalTime || -1;
      return bTime - aTime;
    });
    res.nodes.forEach((node, index) => {
      if (node.data?.profilingData) {
        (node.data as ExplainNode).profilingData.rank = index;
      }
    });
    this.totalRows = totalRows;
    this.totalTime = totalTime;

    return res;
  }

  registerShape() {
    const shapeWidth = 450;
    const shapeHeight = this.config.type === "explain" ? 120 : 160;
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
                width={shapeWidth}
                height={shapeHeight}
                rx={20}
                ry={20}
                fill="#fff"
              />
              <foreignObject
                width={shapeWidth}
                height={shapeHeight}
                x={0}
                y={0}
              >
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    // extend the polyline
    this.editor.graph.line.registeLine("explainLine", {
      render(line: InstanceLine) {
        const { from, to, data } = line;
        if (self.config.type !== "explain") {
          if (data.data?.rows !== undefined) {
            data.label =
              self.renderSplitNum(data.data?.rows as number) + " rows";
          }
          // save the size to data for later compute
          (data.data as AnyMap).width =
            ((data.data?.rows as number) / self.totalRows) * 100 + 5;
          const base = (data.data?.width as number) || 10;
          const width = Math.min(base * 2.5, base + 40);
          const height = Math.min(width * 0.8, 30);
          (data.data as AnyMap).arrowHeight = height;
          (data.data as AnyMap).arrowWidth = width;
          this.endGap = height;
        }

        const pathString = (this as any).makePath(from, to, line);
        const shape = line.shape ? line.shape : Utils.SVGHelper.group();
        line.shape = shape;
        const path = line.path
          ? line.path
          : (line.path = Utils.SVGHelper.path());
        const shadowPath = line.shadowPath
          ? line.shadowPath
          : (line.shadowPath = Utils.SVGHelper.path());
        Utils.dom.setAttrs(path, {
          d: pathString,
          class: "ve-line-path",
          "stroke-dasharray": data.data?.isLoop ? "5,5" : "none",
          fill: "none",
          "stroke-width": data.data?.width || 5,
          "pointer-events": "visiblepainted",
          stroke: "#86C5FF",
          ...((data.style as AnyMap) || {}),
        });
        Utils.dom.setAttrs(shadowPath, {
          d: pathString,
          stroke: "transparent",
          fill: "none",
          "pointer-events": "visiblestroke",
        });
        line.pathData = new Utils.Path(pathString);
        shadowPath.setAttribute("class", "ve-shdow-path");
        shape.appendChild(shadowPath);
        shape.appendChild(path);
        this.renderLabel && this.renderLabel(line);
        return shape;
      },
      renderArrow(line?: InstanceLine) {
        if (!line) {
          return Utils.SVGHelper.path();
        }
        const { to, data } = line;
        const width = (data.data?.arrowWidth as number) || 10;
        const height = (data.data?.arrowHeight as number) || 10;
        const angle = (this as any).getPointAngle(to);
        const pathString = `M${0} ${0}L${height} ${width / 2}L${height} ${
          -width / 2
        }Z`;
        const path = line.arrow ? line.arrow : Utils.SVGHelper.path();
        // 进行角度的中心变换
        const matrix = mat2d.create();
        mat2d.translate(matrix, matrix, [to.x, to.y]);
        mat2d.rotate(matrix, matrix, angle);
        Utils.dom.setAttrs(path, {
          class: "ve-line-arrow",
          d: pathString,
          fill: "#86C5FF",
          transform: `matrix(${matrix.join(",")})`,
          ...(line.data.arrowStyle as AnyMap),
        });
        return path;
      },
    });
    this.initShadowFilter(this.editor.svg!);
  }

  renderNode = (data: VEditorNode) => {
    const { profilingData, operatorInfo } = data.data as ExplainNode;
    const progress = (profilingData?.totalTime / this.totalTime) * 100;
    const rank = profilingData?.rank || 0;
    const green = [14, 188, 156];
    const red = [235, 87, 87];
    const yellow = [242, 201, 76];
    const color = rank === 0 ? red : rank === 1 ? yellow : green;
    return (
      <div className={styles.explainNode} data-name={data.data?.name}>
        <div className={styles.header}>
          <div className="node-text">{data.name}</div>
        </div>
        <ul className={styles.body}>
          <li>
            <span className={styles.label}>outputVar:</span>
            {this.renderOutputVar(operatorInfo?.outputVar)}
          </li>
          <li>
            <span className={styles.label}>inputVar:</span>
            <span>{operatorInfo?.inputVar}</span>
          </li>
          {profilingData && this.config.type === "profile" ? (
            <li className={styles.totalTime}>
              <span className={styles.label}>totalTime:</span>
              <span>{this.renderSplitNum(profilingData.totalTime)} us</span>
              <span className={styles.progress}>
                <span
                  style={{
                    width: `${Math.max(progress, 1)}%`,
                    backgroundColor: `rgb(${color.join(",")})`,
                  }}
                ></span>
              </span>
            </li>
          ) : null}
        </ul>
      </div>
    );
  };

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
        <span key={key} className={styles.ouputLabel}>
          {key}:
        </span>,
        <span key={key + "val"} className={styles.ouputVal}>
          {" "}
          {JSON.stringify(data[key])}
        </span>
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

  initShadowFilter = (svg: SVGElement) => {
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "g");
    ReactDOM.render(
      <>
        <filter id="ve-blue-shadow" filterUnits="userSpaceOnUse">
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feFlood floodColor="#0091ff" />
          <feComposite in2="offsetblur" operator="in" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </>,
      filter
    );
    svg.querySelector("defs")?.appendChild(filter);
  };
}
export default ExplainPlugin;
