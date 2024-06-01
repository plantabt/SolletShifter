import { SvgIconProps } from "@mui/joy/SvgIcon/SvgIconProps";
import { ReactElement } from "react";

export interface AccountInfo{
    mnemonic:string;
    privatekey:string;
    account_name:string;
}

export interface MintItem{
    name?: string,
    icon?: ReactElement<SvgIconProps>,
    balance?: number,
    token?: string,
  }

export interface LoginInfo{
    username?:string;
    phrase?:string;
    privatekey?:string;
}