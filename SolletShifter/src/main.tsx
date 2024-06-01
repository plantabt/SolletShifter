
import { Buffer } from 'buffer';
window.Buffer = Buffer;

import ReactDOM from "react-dom/client";

import "./styles.css";

import App from "./App";
import { CssVarsProvider, StyledEngineProvider } from "@mui/joy/styles";

import store from "./store"
import { Provider } from "react-redux";
/*** <React.StrictMode > </React.StrictMode>,*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <StyledEngineProvider injectFirst >
      <CssVarsProvider>
        <Provider store={store}>
        <App />
        </Provider>
      </CssVarsProvider>
    </StyledEngineProvider>
);
