import { useState, useEffect} from "react";
import "./App.css";
import run from "./stringFetcher";
import {client,send} from './Beacon'
import { TezosOperationType } from "@airgap/beacon-sdk";

function App() {
  const [string, setString] = useState("Hello friends");
  const [address, setAddress] = useState(undefined);

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
    const init  =  async () => {
      // Usually people don't want the "pairing" screen to pop up on page load, so let's just read the state from storage.
      client.getActiveAccount().then(activeAccount => {
        if (activeAccount) {
          // We have an active account, this means beacon is paired and ready to receive operations!
          setAddress(activeAccount.address)
        } else {
          // No active account found, this means beacon was not initiated, or wallet was disconnected.
        }
      })
    };
    init();
  },[])

  return (
    <div className="App">
      <h1>
        This is the string - {string} <span></span>
      </h1>
      {
      address ? 
      <h3>
        Connected {address} <span></span>
      </h3>
      : undefined
      }
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
