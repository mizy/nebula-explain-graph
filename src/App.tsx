import "./App.css";
import { Button } from "antd";
import Explain  from "./Explain";
import { useState } from "react";
import profile from "./assets/profile.json";
import explain from "./assets/explain.json";
import { ExplainData } from './Shape';

function App() {
  const [hide, setHide] = useState(0);
  return (
    <>
      <div className="card">
        <Button type="primary" onClick={() => setHide(1)}>
          hide 1
        </Button>
        <Button type="primary" onClick={() => setHide(2)}>
          hide 2
        </Button>
        <Button type="primary" onClick={() => setHide(0)}>
          cancel
        </Button>
        <br />
      </div>
      <div
        style={{
          display: hide === 1 ? "none" : "block",
        }}
      >
        <Explain
          // type="explain"
          // data={profileData.map((each) => convertExplainData(each))}
          data={profile as unknown as ExplainData}
          style={{ width: 1000, height: 800 }}
          gql="PROFILE match (v:monster)-[e]-(v1:monster) return v,e,v1;"
        />
      </div>
      <div
        style={{
          display: hide === 2 ? "none" : "block",
        }}
      >
        <Explain
          // type="explain"
          // data={profileData.map((each) => convertExplainData(each))}
          data={explain as ExplainData}
          style={{ width: 1000, height: 800 }}
          gql="PROFILE match (v:monster)-[e]-(v1:monster) return v,e,v1;"
        />
      </div>
    </>
  );
}

export default App;
