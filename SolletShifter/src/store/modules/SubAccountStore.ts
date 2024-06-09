import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubAccount } from '../../request/common';


interface SubAccountState {
    subaccounts:{[key:string]:SubAccount}
}

const initialState: SubAccountState = {
    subaccounts:{},
};

const SubAccountStore = createSlice({
  name: 'SubAccountStore',
  initialState,
  reducers: {
    addSubAccount:(state,action:PayloadAction<SubAccount>)=>{
        state.subaccounts[action.payload.privkey]=action.payload;
    },
    delSubAccount:(state, action:PayloadAction<{privkey:string}>)=>{
        delete state.subaccounts[action.payload.privkey];
    },

  },
});

export const {  addSubAccount,delSubAccount } = SubAccountStore.actions;
export default SubAccountStore.reducer;
