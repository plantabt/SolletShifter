
import { Buffer } from 'buffer';
window.Buffer = Buffer;
import React from "react";
import ReactDOM from "react-dom/client";

import "./styles.css";

import App from "./App";
import { CssVarsProvider, StyledEngineProvider } from "@mui/joy/styles";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

/*** <React.StrictMode > </React.StrictMode>,*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StyledEngineProvider injectFirst >
      <CssVarsProvider>

        <App />

      </CssVarsProvider>
    </StyledEngineProvider>
);