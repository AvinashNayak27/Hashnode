import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./app";
import { BrowserRouter as Router } from "react-router-dom";
import {
  LivepeerConfig,
  createReactClient,
  studioProvider,
} from "@livepeer/react";

const livepeerClient = createReactClient({
  provider: studioProvider({
    apiKey: "76831c0e-4b22-4db5-9867-45362ce2bb32",
  }),
});

ReactDOM.render(
  <LivepeerConfig client={livepeerClient}>
    <Router>
      <App />
    </Router>
  </LivepeerConfig>,
  document.getElementById("root")
);
