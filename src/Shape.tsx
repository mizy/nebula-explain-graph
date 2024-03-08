import {
  VEditorData,
  VEditorNode,
  VEditorLine,
} from "@vesoft-inc/veditor/types/Model/Schema";
import { InstanceNode } from "@vesoft-inc/veditor/types/Shape/Node";
import { Utils, VEditor } from "@vesoft-inc/veditor";
import styles from "./Explain.module.less";
import { InstanceLine } from "@vesoft-inc/veditor/types/Shape/Line";
import { AnyMap } from "@vesoft-inc/veditor/types/Utils";
import { mat2d } from "gl-matrix";
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Color from 'color';
export const colors = ["#D32F2F", "#FF6F00", "#F2C94C", "#00BFA5"];
export const pipelineColors = ["#FA5AD7", "#F2C94C", "#00BFA5", "#FF6F00"];
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
  preamble?: 'explain'|'profile';
  buildTimeInUs: number;
  optimizeTimeInUs: number;
  header: string[];
  planNodes?: ExplainNode[];
  operators?:  ProfileStats;
};

export type ProfileStats = {
  startTimeMs: number;
  endTimeMs: number;
  durationMs: number;
  pipelines: PipelineStats[]
}

export type PipelineStats = {
  blockTimes: number;
  yieldTimes: number;
  consumerOperatorId: OperatorUniqueId;
  operators: OperatorStats[];
}

export type OperatorStats = {
  id: OperatorUniqueId; 
  timeMs?: number;
  preamble?: 'explain' | 'profile';
  pipelineId: string;
  [key: string]: any;//too many fields
}
export type OperatorUniqueId = {
	pipelineId: number
	operatorId: number
	planNodeId: number
	inStorage:  boolean
}

export type ExplainConfig = {
  data?: ExplainData;
};
class ExplainPlugin {
  editor: VEditor;
  config: ExplainConfig;
  data?: VEditorData;
  totalTime = 0;
  totalRows = 0;
  pipelineColorMap: Record<string, string> = {};
  colorIndex = 0;
  constructor(editor: VEditor, config?: ExplainConfig) {
    this.editor = editor;
    this.config = config || {};
    this.init();
  }

  async init() {
    this.registerShape();
    if (this.config.data) {
      await this.setData(this.config.data);
    }
  }

  async setData(data: ExplainData) {
    this.data = this.convertData(data);
    await this.editor.schema.setInitData(this.data);
    this.editor.config.dagreOption = {
      rankdir: "BT",
      // ranker: "longest-path",
      ranksep: 300,
      nodesep:100,
      align: undefined,
    };
    this.editor.schema.format();
    this.editor.controller.autoScale();
    this.editor.controller.autoFit();
  }

  getPipelineColor() {
    const color = pipelineColors[this.colorIndex++];
    if (color) {
      return color;
    }
    const randomColor = "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return randomColor;
  }

  convertData(data: ExplainData): VEditorData {
    switch (data.preamble) {
      case "explain":
        return this.convertExplainData(data);
      case "profile":
        return this.convertProfileData(data);
    }
    throw new Error("invalid explain data");
  }

  convertExplainData(data: ExplainData): VEditorData {
    const { planNodes } = data;
    if (!planNodes) {
      throw new Error("invalid explain data");
    }
    const res: VEditorData = {
      nodes: [],
      lines: [],
    };
    const planMap = {} as Record<number, ExplainNode>;
    planNodes.forEach((data) => {
      planMap[data.id] = data;
      const node: VEditorNode = {
        uuid: data.id.toString(),
        name: data.name,
        x: 0,
        y: 0,
        type: "explainNode",
        data: {
          preamble: "explain",
          ...data,
        },
      };
      res.nodes.push(node);
    });
    planNodes.forEach((data) => {
      const children = data.children || [];
      children.forEach((childId) => {
        const child = planMap[childId];
        const line: VEditorLine = {
          from: data.id.toString(),
          to: child.id.toString(),
          fromPoint: 2,
          toPoint: 3,
          type: "explainLine",
          data: {},
        };
        res.lines.push(line);
      });
    });

    return res;
  }

  convertProfileData(data: ExplainData): VEditorData {
    const { operators } = data;
    if (!operators) {
      throw new Error("invalid profile data");
    }
    const res: VEditorData = {
      nodes: [],
      lines: [],
    };
    this.totalRows = 0;
    this.colorIndex = 0;
    const operatorMap = {} as Record<string, OperatorStats>;
    operators.pipelines.forEach((pipeline) => {
      const consumerOperatorId = pipeline.consumerOperatorId;
      const consumerId = this.getOperatorId(consumerOperatorId);
      let prevOperator: OperatorStats | null = null;
      if (operatorMap[consumerId]) {
        prevOperator = operatorMap[consumerId];
      }
      pipeline.operators?.forEach((operator) => {
        const id = this.getOperatorId(operator.id); 
        operator.timeMs = this.parseTimeToMs(operator.time);
        operator.pipelineId = `${operator.id.inStorage ? "SP" : "P"}${operator.id.pipelineId}`;
        if (!this.pipelineColorMap[operator.pipelineId]) {
          this.pipelineColorMap[operator.pipelineId] =this.getPipelineColor();
        }
        const node: VEditorNode = {
          uuid: id,
          name: operator.name,
          x: 0,
          y: 0,
          type: "explainNode",
          data: {
            ...operator,
            preamble: "profile",
          },
        };
        res.nodes.push(node);
        if (prevOperator) {
          const line: VEditorLine = {
            from: this.getOperatorId(prevOperator.id),
            to:id ,
            fromPoint: 2,
            toPoint: 3,
            type: "explainLine",
            data: {
              rows: operator?.rows,
            },
          };
          this.totalRows = Math.max(operator?.rows, this.totalRows);
          res.lines.push(line);
        }
        if (operatorMap[id]) {
          throw new Error("duplicate operator id " + id);
        }
        prevOperator = operator;
        operatorMap[id] = operator;
      })
    });
    res.lines = res.lines.sort((a, b) => a.data?.rows as number - (b.data?.rows as number));
    res.nodes = res.nodes.sort((a, b) => a.data?.timeMs as number - (b.data?.timeMs as number)).map((node, index) => {
      (node.data as OperatorStats).rank = index;
      return node;
    });
    this.totalTime = operators.durationMs;
    return res;
  }

  getOperatorId(id: OperatorUniqueId) {
    return `${id.pipelineId}-${id.operatorId}-${id.planNodeId}`;
  }

  registerShape() {
    const shapeWidth = 300;
    const shapeHeight = this.config.data?.preamble === "explain" ? 90 : 180;
    this.editor.graph.node.registeNode(
      "explainNode",
      {
        render: (instanceNode: InstanceNode) => {
          const { data } = instanceNode;
          instanceNode.shape = instanceNode.shape
            ? instanceNode.shape
            : document.createElementNS("http://www.w3.org/2000/svg", "g");
          (instanceNode as any).reactRoot = (instanceNode as any).reactRoot || createRoot(instanceNode.shape);
          flushSync(() => {
            (instanceNode as any).reactRoot.render(
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
            </>
          );
          })
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
        if (self.config.data?.preamble !== "explain") {
          if (data.data?.rows !== undefined) {
            data.label =
              self.renderSplitNum(data.data?.rows as number) + " rows";
          }
          // save the size to data for later compute
          (data.data as AnyMap).width =
            ((data.data?.rows as number) / self.totalRows) * 80 + 5;
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
    this.initShadowFilter(this.editor);
  }

  getReverseColor(colorString: string) :string {
    const color = Color(colorString);
    const luminosity = color.luminosity();
    if (luminosity > 0.5) {
      return "#00000080";
    } else {
      return "#fff";
    }

  }

  renderNode = (data: VEditorNode) => {
    const nodeData = data.data as NodeData;
    const explainData = (nodeData.preamble === "explain" ? nodeData : null) as ExplainNode;
    const profilingData = (nodeData.preamble === "profile" ? nodeData : null) as OperatorStats;
    const progress = ((profilingData?.timeMs||0) / this.totalTime) * 100;
    const rank = profilingData?.rank || 0;
    const color = colors[rank] || "#00BFA5";
    const piplelineColor = this.pipelineColorMap[profilingData?.pipelineId];
    return (
      <div className={styles.explainNode} data-name={data.data?.name}>
        <div className={styles.header}>
          <div className="node-text">{data.name}</div>
          {profilingData && <div className={styles.pipelineID} style={{
            backgroundColor: piplelineColor,
            color: this.getReverseColor(piplelineColor)
          }}>
            {profilingData.id.inStorage ? "SP" : "P"}
            {profilingData.id.pipelineId}
          </div>}
        </div>
        <ul className={styles.body}>
          {explainData&&<li>
            <span className={styles.label}>info:</span>
            {this.renderOutputVar(nodeData?.details)}
          </li>}
          {profilingData && (
            <>
              <li>
                <span className={styles.label}>info:</span>
                {this.renderOutputVar(profilingData.planNodeInfo)}
              </li>
              <li>
                <span className={styles.label}>memory:</span>
                <span>{profilingData?.memory}</span>
              </li>
            </>)}
          {profilingData ? (
            <>
            <li className={styles.totalTime}>
              <span className={styles.label}>time:</span>
                <span>{profilingData?.time}</span>
                <div
                  className={styles.progress}
                >
                <span
                style={{
                  width: `${Math.max(progress, 1)}%`,
                  backgroundColor: `${color}`,
                }}
                  ></span>
                  </div>
            </li>
            </>
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

  renderSplitNum(num?: number): string {
    if(num === undefined) return "-";
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

  //refer https://github.com/vesoft-inc/nebula-ng/blob/master/src/exec/ExecutionStats.h#L166
  parseTimeToMs(time: string):number {
    const units = time.slice(-2);
    const value = parseFloat(time);
    switch (units) {
      case 'ns':
        return value / 1e6;
      case 'us':
        return value / 1e3;
      case 'ms':
        return value;
      case ' s':
        return value * 1e3;
      default:
        throw new Error(`Unknown time unit: ${units}`);
    }
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

  initShadowFilter = (editor: VEditor) => {
    const shadow = editor.graph.shadow?.querySelector("defs");
    if (!shadow) return;
    const filter = Utils.dom.svgWrapper(`<filter id="ve-blue-shadow" >
          <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
          <feOffset dx="0" dy="1" result="offsetblur" />
          <feFlood flood-color="#0091ff" />
          <feComposite in2="offsetblur" operator="in" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>`);
    shadow?.appendChild(filter);
  };
}
export default ExplainPlugin;
