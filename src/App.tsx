import "./App.css";
import { Button } from "antd";
import Explain, { convertExplainData, convertedDashboardData } from "./Explain";

const dashboardSlowQueryData = [
  {
    dependencies: [6],
    description: [
      {
        inputVar:
          '[{"colNames":["_path"],"type":"DATASET","name":"__BFSShortest_5"}]',
      },
      {
        distinct: "false",
      },
      {
        kind: "BFS SHORTEST",
      },
    ],
    id: 7,
    name: "DataCollect",
    outputVar: '{"colNames":["p"],"type":"DATASET","name":"__DataCollect_7"}',
    profiles: [
      {
        execDurationInUs: 12,
        rows: 0,
        totalDurationInUs: 29,
      },
    ],
  },
  {
    dependencies: [0],
    description: [
      {
        inputVar: "",
      },
      {
        condition:
          "(((++($__VAR_3)<=3) AND ($__VAR_2==false)) AND (($__BFSShortest_5==__EMPTY__) OR (size($__BFSShortest_5)==0)))",
      },
      {
        loopBody: "5",
      },
    ],
    id: 6,
    name: "Loop",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__Loop_6"}',
    profiles: [
      {
        execDurationInUs: 57,
        rows: 1,
        totalDurationInUs: 58,
      },
      {
        execDurationInUs: 13,
        rows: 1,
        totalDurationInUs: 15,
      },
    ],
  },
  {
    branchInfo: {
      conditionNodeId: 6,
      isDoBranch: true,
    },
    dependencies: [3, 4],
    description: [
      {
        inputVar:
          '{"rightVar":"__GetNeighbors_4","leftVar":"__GetNeighbors_3"}',
      },
      {
        LeftNextVidVar: '"__VAR_0"',
      },
      {
        RightNextVidVar: '"__VAR_1"',
      },
      {
        steps: "5",
      },
      {
        singleShortest: "false",
      },
      {
        limit: "-1",
      },
    ],
    id: 5,
    name: "BFSShortest",
    outputVar:
      '{"colNames":["_path"],"type":"DATASET","name":"__BFSShortest_5"}',
    profiles: [
      {
        execDurationInUs: 97,
        rows: 0,
        totalDurationInUs: 151,
      },
    ],
  },
  {
    dependencies: [2],
    description: [
      {
        inputVar: "__VAR_0",
      },
      {
        space: "1",
      },
      {
        dedup: "1",
      },
      {
        limit: "-1",
      },
      {
        filter: "",
      },
      {
        orderBy: "[]",
      },
      {
        src: "COLUMN[0]",
      },
      {
        edgeTypes: "[]",
      },
      {
        edgeDirection: "OUT_EDGE",
      },
      {
        vertexProps: "",
      },
      {
        edgeProps: '[{"props":["_dst","_rank","_type"],"type":8}]',
      },
      {
        statProps: "",
      },
      {
        exprs: "",
      },
      {
        random: "false",
      },
    ],
    id: 3,
    name: "GetNeighbors",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__GetNeighbors_3"}',
    profiles: [
      {
        execDurationInUs: 127,
        otherStats: {
          "resp[0]":
            '{\n  "exec": "904(us)",\n  "host": "192.168.8.240:9779",\n  "storage_detail": {\n    "GetNeighborsNode": "387(us)",\n    "HashJoinNode": "377(us)",\n    "RelNode": "387(us)",\n    "SingleEdgeNode": "373(us)"\n  },\n  "total": "2053(us)",\n  "vertices": 1\n}',
          total_rpc_time: "2207(us)",
        },
        rows: 0,
        totalDurationInUs: 2357,
      },
    ],
  },
  {
    dependencies: [1],
    description: [
      {
        inputVar: "__Start_1",
      },
    ],
    id: 2,
    name: "PassThrough",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__PassThrough_2"}',
    profiles: [
      {
        execDurationInUs: 15,
        rows: 0,
        totalDurationInUs: 24,
      },
    ],
  },
  {
    id: 1,
    name: "Start",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__Start_1"}',
    profiles: [
      {
        execDurationInUs: 0,
        rows: 0,
        totalDurationInUs: 7,
      },
    ],
  },
  {
    dependencies: [2],
    description: [
      {
        inputVar: "__VAR_1",
      },
      {
        space: "1",
      },
      {
        dedup: "1",
      },
      {
        limit: "-1",
      },
      {
        filter: "",
      },
      {
        orderBy: "[]",
      },
      {
        src: "COLUMN[0]",
      },
      {
        edgeTypes: "[]",
      },
      {
        edgeDirection: "OUT_EDGE",
      },
      {
        vertexProps: "",
      },
      {
        edgeProps: '[{"props":["_dst","_rank","_type"],"type":-8}]',
      },
      {
        statProps: "",
      },
      {
        exprs: "",
      },
      {
        random: "false",
      },
    ],
    id: 4,
    name: "GetNeighbors",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__GetNeighbors_4"}',
    profiles: [
      {
        execDurationInUs: 102,
        otherStats: {
          "resp[0]":
            '{\n  "exec": "809(us)",\n  "host": "192.168.8.240:9779",\n  "storage_detail": {\n    "GetNeighborsNode": "387(us)",\n    "HashJoinNode": "377(us)",\n    "RelNode": "387(us)",\n    "SingleEdgeNode": "373(us)"\n  },\n  "total": "2053(us)",\n  "vertices": 1\n}',
          total_rpc_time: "2207(us)",
        },
        rows: 0,
        totalDurationInUs: 2354,
      },
    ],
  },
  {
    id: 0,
    name: "Start",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__Start_0"}',
    profiles: [
      {
        execDurationInUs: 0,
        rows: 0,
        totalDurationInUs: 20,
      },
    ],
  },
];
const profileData = [
  {
    dependencies: "3",
    id: 4,
    name: "Project",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "src",\n    "dst"\n  ],\n  "type": "DATASET",\n  "name": "__Project_4"\n}\ninputVar: __ExpandAll_3\ncolumns: [\n  "src(EDGE) AS src",\n  "dst(EDGE) AS dst"\n]',
    "profiling data":
      '{\n  "execTime": "26(us)",\n  "rows": 2,\n  "totalTime": "34(us)",\n  "version": 0\n}',
  },
  {
    dependencies: "2",
    id: 3,
    name: "ExpandAll",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "EDGE"\n  ],\n  "type": "DATASET",\n  "name": "__ExpandAll_3"\n}\ninputVar: __Expand_2\nspace: 2077\ndedup: 0\nlimit: -1\nfilter: \norderBy: []\nsample: false\njoinInput: false\nmaxSteps: 1\nedgeProps: [\n  {\n    "props": [\n      "_dst",\n      "_rank",\n      "_src",\n      "_type",\n      "degree"\n    ],\n    "type": 2081\n  }\n]\nstepLimits: []\nminSteps: 1\nvertexProps: \nvertexColumns: []\nedgeColumns: [\n  "EDGE AS EDGE"\n]',
    "profiling data":
      '{\n  "execTime": "89(us)",\n  "graphExpandAllTime+2": "45(us)",\n  "resp[0]": {\n    "exec": "535(us)",\n    "host": "192.168.8.131:9779",\n    "storage_detail": {\n      "GetNeighborsNode": "234(us)",\n      "HashJoinNode": "220(us)",\n      "RelNode": "234(us)",\n      "SingleEdgeNode": "218(us)"\n    },\n    "total": "1147(us)"\n  },\n  "rows": 2,\n  "totalTime": "1412(us)",\n  "version": 0\n}',
  },
  {
    dependencies: "1",
    id: 2,
    name: "Expand",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "_expand_vid"\n  ],\n  "type": "DATASET",\n  "name": "__Expand_2"\n}\ninputVar: __VAR_0\nspace: 2077\ndedup: 0\nlimit: \nfilter: \norderBy: []\nsample: false\njoinInput: false\nmaxSteps: 0\nedgeProps: [\n  {\n    "props": [\n      "_dst"\n    ],\n    "type": 2081\n  }\n]\nstepLimits: []',
    "profiling data":
      '{\n  "execTime": "14(us)",\n  "rows": 1,\n  "totalTime": "29(us)",\n  "version": 0\n}',
  },
  {
    dependencies: "",
    id: 1,
    name: "Start",
    "operator info":
      'outputVar: {\n  "colNames": [],\n  "type": "DATASET",\n  "name": "__Start_1"\n}',
    "profiling data":
      '{\n  "execTime": "0(us)",\n  "rows": 0,\n  "totalTime": "18(us)",\n  "version": 0\n}',
  },
];

const explainData = [
  {
    dependencies: "3",
    id: 4,
    name: "Project",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "src",\n    "dst"\n  ],\n  "type": "DATASET",\n  "name": "__Project_4"\n}\ninputVar: __ExpandAll_3\ncolumns: [\n  "src(EDGE) AS src",\n  "dst(EDGE) AS dst"\n]',
    "profiling data": "",
  },
  {
    dependencies: "2",
    id: 3,
    name: "ExpandAll",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "EDGE"\n  ],\n  "type": "DATASET",\n  "name": "__ExpandAll_3"\n}\ninputVar: __Expand_2\nspace: 2077\ndedup: 0\nlimit: -1\nfilter: \norderBy: []\nsample: false\njoinInput: false\nmaxSteps: 1\nedgeProps: [\n  {\n    "props": [\n      "_dst",\n      "_rank",\n      "_src",\n      "_type",\n      "degree"\n    ],\n    "type": 2081\n  }\n]\nstepLimits: []\nminSteps: 1\nvertexProps: \nvertexColumns: []\nedgeColumns: [\n  "EDGE AS EDGE"\n]',
    "profiling data": "",
  },
  {
    dependencies: "1",
    id: 2,
    name: "Expand",
    "operator info":
      'outputVar: {\n  "colNames": [\n    "_expand_vid"\n  ],\n  "type": "DATASET",\n  "name": "__Expand_2"\n}\ninputVar: __VAR_0\nspace: 2077\ndedup: 0\nlimit: \nfilter: \norderBy: []\nsample: false\njoinInput: false\nmaxSteps: 0\nedgeProps: [\n  {\n    "props": [\n      "_dst"\n    ],\n    "type": 2081\n  }\n]\nstepLimits: []',
    "profiling data": "",
  },
  {
    dependencies: "",
    id: 1,
    name: "Start",
    "operator info":
      'outputVar: {\n  "colNames": [],\n  "type": "DATASET",\n  "name": "__Start_1"\n}',
    "profiling data": "",
  },
];
dashboardSlowQueryData;
profileData;
console.log(explainData.map((each) => convertExplainData(each)));

function App() {
  return (
    <>
      <div className="card">
        <Button type="primary">show explain</Button>
        <Button type="primary">show profile</Button>
        <br />
      </div>
      <Explain
        // type="explain"
        // data={profileData.map((each) => convertExplainData(each))}
        data={convertedDashboardData(dashboardSlowQueryData)}
        style={{ width: 1000, height: 800 }}
        gql="PROFILE match (v:monster)-[e]-(v1:monster) return v,e,v1;"
      />
    </>
  );
}

export default App;
