import { configureStore } from "@reduxjs/toolkit";
import LoginInfoStore from "./modules/LoginInfoStore"
const store = configureStore({
    reducer: {
        auth:LoginInfoStore
    }
})
export type RootState = ReturnType<typeof store.getState>;
//export type AppDispatch = typeof store.dispatch;
export default store;