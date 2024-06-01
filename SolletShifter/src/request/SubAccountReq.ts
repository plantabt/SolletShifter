
import { HttpReqeust } from "./HttpReqeust";
import {CreateSubAccountPayload} from "./common";


export class SubAccountReq {

  public static async CreateSubAccount(server:string,regData:CreateSubAccountPayload) {
    let url = server+"/subaccount/create";
    return await HttpReqeust.post(url,regData);
  }
  public static async GetSubAccounts(server:string,owner:string,token:string) {
    let url = server+"/subaccount/"+owner+"/"+ token+"";
    return await HttpReqeust.GetData(url);
  }
  public static async DelSubAccounts(server:string,owner:string,privatekey:string,token:string) {
    let url = server+"/subaccount/"+owner+"/"+privatekey+"/"+ token+"";
    return await HttpReqeust.DeleteData(url);
  }
}