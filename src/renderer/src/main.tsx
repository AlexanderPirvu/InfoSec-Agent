import "./assets/base.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Theme } from "@radix-ui/themes";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance={"dark"} radius="full" scaling="110%">
      <App />
    </Theme>
  </React.StrictMode>,
);
