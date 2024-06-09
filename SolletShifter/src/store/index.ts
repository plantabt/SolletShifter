import { configureStore } from "@reduxjs/toolkit";
import LoginInfoStore from "./modules/LoginInfoStore"
import SubAccountStore from "./modules/SubAccountStore";
const store = configureStore({
    reducer: {
        auth:LoginInfoStore,
        subaccounts:SubAccountStore
    }
})
export type RootState = ReturnType<typeof store.getState>;
//export type AppDispatch = typeof store.dispatch;
export default store;