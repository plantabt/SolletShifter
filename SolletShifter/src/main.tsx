
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import ReactDOM from "react-dom/client";

import "./styles.css";

import App from "./App";
import { CssVarsProvider, StyledEngineProvider } from "@mui/joy/styles";


/*** <React.StrictMode > </React.StrictMode>,*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StyledEngineProvider injectFirst >
      <CssVarsProvider>

        <App />

      </CssVarsProvider>
    </StyledEngineProvider>
);
