import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginInfoState {
  isLoggedIn: boolean;
  username: string;
  privatekey:string;
  token: string | "";
}

const initialState: LoginInfoState = {
  isLoggedIn: false,
  username: '',
  privatekey:'',
  token: "",
};

const LoginInfoStore = createSlice({
  name: 'LoginInfoStore',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; token: string,privatekey:string }>) => {
      state.isLoggedIn = true;
      state.username = action.payload.username;
      state.privatekey = action.payload.privatekey;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.username = "";
      state.privatekey="";
      state.token = "";
    },
  },
});

export const { login, logout } = LoginInfoStore.actions;
export default LoginInfoStore.reducer;
