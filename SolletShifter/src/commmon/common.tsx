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

export function formatText(text: string,limit:number) {
    if (text == undefined) {
      return "";
    }
    if (text.length <= 0) {
      return text;
    }

    const startChars = limit; // 显示前10个字符
    const endChars = limit; // 显示后10个字符
    const dots = "...";

    const start = text.substring(0, startChars);
    const end = text.substring(text.length-endChars,text.length);

    return `${start}${dots}${end}`;
  }