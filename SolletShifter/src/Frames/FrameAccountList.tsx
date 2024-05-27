import "./FrameAccountList.css"
import AccountInfoCard from "../componnet/AccountInfoCard";
import IconButtonEx from "../componnet/IconButtonEx";

import { Box, Divider, Grid } from "@mui/joy";
import { Fragment } from "react/jsx-runtime";
import AddIcon from '../assets/imgs/AddIcon.png'
import ImportIcon from '../assets/imgs/ImportIcon.png'

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface FrameAccountListExportRef{
  CreateAccount:(cardInfo:CardItem)=>void;
}
interface ComponnetRef{
    onCreateAccount:()=>void;
    onImportAccount:()=>void;
}
export interface CardItem{
    mnemonic:string;
    privatekey:string;
    account_name:string;
  }
  

const FrameAccountList = forwardRef<FrameAccountListExportRef,ComponnetRef>((props,ref)=> {
    const {onCreateAccount,onImportAccount}=props;
    
    const [AccountCards,setAccountCards] = useState<CardItem[]>([]);

    useImperativeHandle(ref,()=>({
      CreateAccount:(cardInfo:CardItem)=>{
        setAccountCards(currentCards=>[...currentCards,cardInfo]);
      }
    }));
    useEffect(()=>{

    },[]);
    function handleAccountInfoCardClick(index:number){
        console.log(`handleAccountInfoCardClick:${index}`);
     }
     function handleAccountInfoCardRemoveClick(index:number){
        setAccountCards(AccountCards.filter((_item,idx)=>{return idx!==index}));
     }
     function handleCreateAccount(){
        onCreateAccount?.();
     }
     function handleImportAccount(){
        onImportAccount?.();
     }
    return (
        <Fragment>
           <Grid container spacing={0} sx={{ flexGrow: 1}} >
            
            <Grid xs={12} className="flex content-center">
              <IconButtonEx iconPath={AddIcon} onClick={()=>{handleCreateAccount()}} text="Create Account" id={""}/>
              <IconButtonEx iconPath={ImportIcon}  onClick={()=>{handleImportAccount()}} text="Import Account" id={""}/>
            </Grid>
        </Grid>
        <Grid xs={12} className="relative top-14">
          <Divider className=" bg-gray-50 ml-[10px] w-[97%] h-[3px] bg-opacity-30 shadow-md rounded-md"></Divider>
        </Grid>
      <Box className="mx-7 mt-16  w-[95%] overflow-y-auto overflow-x-hidden FrameAccountListClient">
        <Grid container spacing={4} sx={{ flexGrow: 1}}>
            {
              AccountCards.map((item,index)=>(
                <Grid xs={12} key={index}>
                  <AccountInfoCard onClickRemove={()=>handleAccountInfoCardRemoveClick(index)} onClick={()=>handleAccountInfoCardClick(index)} AccountName={item.account_name} Mnemonic={item.mnemonic}/>
                </Grid>
              )) 
             }

        </Grid>
      </Box>

        </Fragment>
    );
});
export default FrameAccountList;