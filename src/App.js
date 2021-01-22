import { useState } from "react";
import "./App.css";
import run from "./stringFetcher";

function App() {
  const [string, setString] = useState("Hello friends");

  const handleSubmit = (evt) => {
    evt.preventDefault();
    run(string);
  };

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
    </div>
  );
}

export default App;
