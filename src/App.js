import { useState, useEffect} from "react";
import "./App.css";
import run from "./stringFetcher";
import {client,send} from './Beacon'
import { TezosOperationType } from "@airgap/beacon-sdk";

function App() {
  const [string, setString] = useState("Hello friends");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    // run(string);
    send({
      kind: TezosOperationType.TRANSACTION,
      amount: 0,
      destination: "KT1VQNU7XC1ZUr4GABrdMCfUaw6cXQ91XxWE",
      parameters: string
    });
  };

  useEffect(() => {
    const init  =  async () => client.init();
    init();
  },[])

  return (
    <div className="App">
      <h1>
        This is the string - {string} <span></span>
      </h1>
      <form onSubmit={handleSubmit}>
        <label for="String">Enter the string</label>
        <input
          type="text"
          id="String"
          name="String"
          value={string}
          onChange={(e) => setString(e.target.value)}
        />
        <br />
        <input type="submit" value="Submit" />
      </form>
      <br />
      Check the status of block at{" "}
      <a href="https://arronax.io/tezos/delphinet/accounts/KT1VQNU7XC1ZUr4GABrdMCfUaw6cXQ91XxWE">
        Arronax
      </a>
    </div>
  );
}

export default App;
