import "./App.css";
import { Button } from "antd";
import Explain, { convertExplainData } from "./Explain";

const dashboardSlowQueryData = [
  {
    id: 11,
    name: "Project",
    profiles: [
      {
        rows: 100,
        execDurationInUs: 1792,
        totalDurationInUs: 1804,
      },
    ],
    outputVar: '{"colNames":["p"],"type":"DATASET","name":"__Limit_8"}',
    description: [
      {
        inputVar: "__Limit_10",
      },
      {
        columns: '["PathBuild[$-.v,$-._e,$-.v2]"]',
      },
    ],
    dependencies: [12],
  },
  {
    id: 12,
    name: "Limit",
    profiles: [
      {
        rows: 100,
        execDurationInUs: 806118,
        totalDurationInUs: 806132,
      },
    ],
    outputVar:
      '{"colNames":["v","e","_e","v2"],"type":"DATASET","name":"__Limit_10"}',
    description: [
      {
        inputVar: "__AppendVertices_13",
      },
      {
        offset: "0",
      },
      {
        count: "100",
      },
    ],
    dependencies: [14],
  },
  {
    id: 14,
    name: "AppendVertices",
    profiles: [
      {
        rows: 779123,
        otherStats: {
          "resp[0]":
            '{\n  "exec": "20689(us)",\n  "host": "192.168.15.98:9779",\n  "total": "29709(us)"\n}',
          "resp[1]":
            '{\n  "exec": "11645(us)",\n  "host": "192.168.15.99:9779",\n  "total": "26328(us)"\n}',
          total_rpc: "39829(us)",
        },
        execDurationInUs: 3801565,
        totalDurationInUs: 3810641,
      },
    ],
    outputVar:
      '{"colNames":["v","e","_e","v2"],"type":"DATASET","name":"__AppendVertices_13"}',
    description: [
      {
        inputVar: "__Traverse_15",
      },
      {
        space: "1",
      },
      {
        dedup: "1",
      },
      {
        limit: "100",
      },
      {
        filter: "",
      },
      {
        orderBy: "[]",
      },
      {
        src: "none_direct_dst($-.e,$-.v)",
      },
      {
        props:
          '[{"props":["name","_tag"],"tagId":3},{"props":["name","_tag"],"tagId":4},{"props":["name","birthdate","_tag"],"tagId":2},{"props":["user_id","_tag"],"tagId":5}]',
      },
      {
        exprs: "",
      },
      {
        vertex_filter: "",
      },
      {
        if_track_previous_path: "true",
      },
    ],
    dependencies: [15],
  },
  {
    id: 15,
    name: "Traverse",
    profiles: [
      {
        rows: 2460622,
        otherStats: {
          "step[1]":
            '{\n  "storage": [\n    {\n      "exec": "692(us)",\n      "host": "192.168.15.99:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "408(us)",\n        "HashJoinNode": "381(us)",\n        "RelNode": "409(us)",\n        "SingleEdgeNode": "234(us)",\n        "TagNode": "121(us)"\n      },\n      "total": "1646(us)",\n      "vertices": 5\n    }\n  ],\n  "total_rpc_time": "1758(us)"\n}',
          "step[2]":
            '{\n  "storage": [\n    {\n      "exec": "865(us)",\n      "host": "192.168.15.99:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "1061(us)",\n        "HashJoinNode": "757(us)",\n        "RelNode": "1062(us)",\n        "SingleEdgeNode": "486(us)",\n        "TagNode": "247(us)"\n      },\n      "total": "1512(us)",\n      "vertices": 3\n    },\n    {\n      "exec": "667(us)",\n      "host": "192.168.15.98:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "346(us)",\n        "HashJoinNode": "233(us)",\n        "RelNode": "347(us)",\n        "SingleEdgeNode": "120(us)",\n        "TagNode": "106(us)"\n      },\n      "total": "1665(us)",\n      "vertices": 1\n    }\n  ],\n  "total_rpc_time": "1815(us)"\n}',
          "step[3]":
            '{\n  "storage": [\n    {\n      "exec": "5558(us)",\n      "host": "192.168.15.99:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "10376(us)",\n        "HashJoinNode": "8796(us)",\n        "RelNode": "10392(us)",\n        "SingleEdgeNode": "6706(us)",\n        "TagNode": "1807(us)"\n      },\n      "total": "9275(us)",\n      "vertices": 247\n    },\n    {\n      "exec": "4998(us)",\n      "host": "192.168.15.98:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "4583(us)",\n        "HashJoinNode": "3969(us)",\n        "RelNode": "4589(us)",\n        "SingleEdgeNode": "3003(us)",\n        "TagNode": "837(us)"\n      },\n      "total": "18677(us)",\n      "vertices": 110\n    }\n  ],\n  "total_rpc_time": "19281(us)"\n}',
          "step[4]":
            '{\n  "storage": [\n    {\n      "exec": "17027(us)",\n      "host": "192.168.15.98:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "16709(us)",\n        "HashJoinNode": "11066(us)",\n        "RelNode": "16721(us)",\n        "SingleEdgeNode": "7842(us)",\n        "TagNode": "2849(us)"\n      },\n      "total": "23268(us)",\n      "vertices": 223\n    },\n    {\n      "exec": "18680(us)",\n      "host": "192.168.15.99:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "34707(us)",\n        "HashJoinNode": "23223(us)",\n        "RelNode": "34745(us)",\n        "SingleEdgeNode": "16008(us)",\n        "TagNode": "6377(us)"\n      },\n      "total": "30396(us)",\n      "vertices": 456\n    }\n  ],\n  "total_rpc_time": "31050(us)"\n}',
          "step[5]":
            '{\n  "storage": [\n    {\n      "exec": "103786(us)",\n      "host": "192.168.15.98:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "102224(us)",\n        "HashJoinNode": "81515(us)",\n        "RelNode": "102347(us)",\n        "SingleEdgeNode": "63216(us)",\n        "TagNode": "15447(us)"\n      },\n      "total": "129798(us)",\n      "vertices": 2651\n    },\n    {\n      "exec": "105868(us)",\n      "host": "192.168.15.99:9779",\n      "storage_detail": {\n        "GetNeighborsNode": "196903(us)",\n        "HashJoinNode": "156825(us)",\n        "RelNode": "197356(us)",\n        "SingleEdgeNode": "119288(us)",\n        "TagNode": "31765(us)"\n      },\n      "total": "154808(us)",\n      "vertices": 4990\n    }\n  ],\n  "total_rpc_time": "159731(us)"\n}',
          expandTime: "106(us)",
          expandTaskRunTime: "[\n  47\n]",
          expandPostTaskTime: "3(us)",
        },
        execDurationInUs: 175175,
        totalDurationInUs: 8927398,
      },
    ],
    outputVar:
      '{"colNames":["v","e","_e"],"type":"DATASET","name":"__Traverse_15"}',
    description: [
      {
        inputVar: "__Dedup_2",
      },
      {
        space: "1",
      },
      {
        dedup: "1",
      },
      {
        limit: "100",
      },
      {
        filter: "",
      },
      {
        orderBy: "[]",
      },
      {
        src: "$-._vid",
      },
      {
        edgeTypes: "[]",
      },
      {
        edgeDirection: "BOTH",
      },
      {
        vertexProps:
          '[{"props":["name","_tag"],"tagId":3},{"props":["name","_tag"],"tagId":4},{"props":["name","birthdate","_tag"],"tagId":2},{"props":["user_id","_tag"],"tagId":5}]',
      },
      {
        edgeProps:
          '[{"props":["_src","_type","_rank","_dst"],"type":-6},{"props":["_src","_type","_rank","_dst"],"type":6},{"props":["_src","_type","_rank","_dst"],"type":-7},{"props":["_src","_type","_rank","_dst"],"type":7},{"props":["_src","_type","_rank","_dst","rate"],"type":-9},{"props":["_src","_type","_rank","_dst","rate"],"type":9},{"props":["_src","_type","_rank","_dst"],"type":-8},{"props":["_src","_type","_rank","_dst"],"type":8}]',
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
      {
        steps: "1..5",
      },
      {
        "vertex filter": "",
      },
      {
        "edge filter": "",
      },
      {
        if_track_previous_path: "false",
      },
      {
        "first step filter": "",
      },
      {
        "tag filter": "",
      },
    ],
    dependencies: [2],
  },
  {
    id: 2,
    name: "Dedup",
    profiles: [
      {
        rows: 5,
        execDurationInUs: 5,
        totalDurationInUs: 7,
      },
    ],
    outputVar: '{"colNames":["_vid"],"type":"DATASET","name":"__Dedup_2"}',
    description: [
      {
        inputVar: "__VAR_0",
      },
    ],
    dependencies: [1],
  },
  {
    id: 1,
    name: "PassThrough",
    profiles: [
      {
        rows: 0,
        execDurationInUs: 4,
        totalDurationInUs: 8,
      },
    ],
    outputVar: '{"colNames":["_vid"],"type":"DATASET","name":"__VAR_0"}',
    description: [
      {
        inputVar: "",
      },
    ],
    dependencies: [3],
  },
  {
    id: 3,
    name: "Start",
    outputVar: '{"colNames":[],"type":"DATASET","name":"__Start_3"}',
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
        data={profileData.map((each) => convertExplainData(each))}
        style={{ width: 1000, height: 800 }}
        gql="PROFILE match (v:monster)-[e]-(v1:monster) return v,e,v1;"
      />
    </>
  );
}

export default App;
