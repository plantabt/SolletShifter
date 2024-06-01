import "./MainFrame.css";
import "./styles.css";
import '@fontsource/inter';
import 'tailwindcss/tailwind.css';
import { createRef, Fragment, useEffect, useRef, useState } from "react";
import WalletIcon from '@mui/icons-material/Wallet';
import MoveUpIcon from '@mui/icons-material/MoveUpRounded';
import ExchangeIcon from '@mui/icons-material/CurrencyExchangeRounded';
import HelpIcon from '@mui/icons-material/QuestionAnswerRounded';


import SolanaIcon from 'cryptocurrency-icons/32/color/sol.png';
import { Grid } from "@mui/joy";

import MenubarButton, { ButtonRef } from "./componnet/MenubarButton";

import NetSelBlock from "./componnet/NetSelBolck";

import FrameCreateAccount from "./Frames/FrameCreateAccount";
import FrameAccountList, { FrameAccountListExportRef } from "./Frames/FrameAccountList";

import FrameImportAccount from "./Frames/FrameImportAccount";
import { AccountInfo } from "./commmon/common";
import FrameTransfer from "./Frames/FrameTransfer";
import { SubAccountReq } from "./request/SubAccountReq";
import { CreateSubAccountPayload } from "./request/common";
import { CallRustDelegate } from "./commmon/CallRustDelegate";
import { JWT } from "./JWT";
import { CryptoSupport } from "./request/CryptoSupport";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import { HttpReqeust } from "./request/HttpReqeust";


const menuBars = [
  { title: "Account", icon: <WalletIcon />, className: " MainFramBarButton", checked: true },
  { title: "Transfer", icon: <MoveUpIcon />, className: " MainFramBarButton", checked: false },
  { title: "Exchange", icon: <ExchangeIcon />, className: " MainFramBarButton", checked: false },
  { title: "Help", icon: <HelpIcon />, className: " MainFramBarButton", checked: false }
];
enum FramePages {
  /* account frames*/
  MainFrame = 0,
  CreateAccount,
  ImportAccount,
  MoreDetails,

  /*transfer frames*/
  MainTranser,

}


function MainFrame() {
  //const changeLoginStore = useDispatch();
  const loginInfoStore = useSelector((state: RootState) => state.auth);
  
  const [CurrentFrame, setCurrentFrame] = useState(FramePages.MainFrame);
  //const [mounted, setMounted] = useState(false);
  //const [value, setValue] = useState<string | null>('default');
  const [lastBarBtn, setLastBarBtn] = useState<ButtonRef | null>(null);

  const ACCONT_FRAME_NAME=["create","import"];
  const BarBtnRefs = useRef(menuBars.map(() => createRef<ButtonRef>()));

  const AccountListExport = useRef<FrameAccountListExportRef>(null);
  /*const BarBtnRefs = useRef<(LegacyRef<ButtonRef>  | null)[]>(menuBars.map(() => null));//useRef<ButtonRef>(null);
  const setRef = useCallback((index: number )=>(instance: any)=>{

     BarBtnRefs.current[index]=instance;
 
  },[]);
  */

  useEffect(() => {
    if(loginInfoStore.isLoggedIn){
      console.log("request list:");
      //get subaccounts
      (async ()=>{
        
        let server=await CallRustDelegate.GetServer();
        let respones_data = await SubAccountReq.GetSubAccounts(server,loginInfoStore.privatekey,JWT.read_token());
        if(respones_data.status==HttpReqeust.STATUS_OK){
          respones_data.data.map((item:any)=>{
            let account = item["account"];
            AccountListExport.current?.CreateAccount({ mnemonic: account.phrase, account_name: account.name ,privatekey:account.privatekey});
        });

      }else if(respones_data.status==HttpReqeust.STATUS_ERROR){
          //setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
      }
        //console.log("SubAccount list:",subaccounts["data"]);
        //AccountListExport.current?.CreateAccount({ mnemonic: account_info.mnemonic, account_name: account_info.account_name ,privatekey:""});
      }
      )();
    }else{

    }
  }, [loginInfoStore]);

  useEffect(() => {
    setTimeout(() => {
      setLastBarBtn(BarBtnRefs.current[0]?.current);
    }, 1000);
  }, []);
  function handleCreateAccount() {
    setCurrentFrame(FramePages.CreateAccount);
    //setAccountCards(currentCards=>[...currentCards,dataSource]);
  }
  function handleImportAccount() {
    setCurrentFrame(FramePages.ImportAccount);
    //setAccountCards(currentCards=>[...currentCards,dataSource]);
  }
  function MenubarOnClick(index: number) {
    try {


      console.log(`MenubarOnClick:`, index, BarBtnRefs.current[index]?.current?.getTitle(), lastBarBtn?.getTitle());

      //console.log(e.target,lastBarBtn.current?.getTitle(),self?.getTitle(),count);
      //BarBtnRefs.current.setChecked(false);
      if (lastBarBtn?.getTitle() == BarBtnRefs.current[index]?.current?.getTitle()) {
        lastBarBtn?.setChecked(true);
        return;
      }
      lastBarBtn?.setChecked(false);
      switch(index){
        case 0://main page
          setCurrentFrame(FramePages.MainFrame);
          break;
        case 1://transfer
          setCurrentFrame(FramePages.MainTranser);
          break;          
      }
      
     
      setLastBarBtn(BarBtnRefs.current[index].current);
    } catch (e) {
      return;
    }
    /*
    if(lastBarBtn==BarBtnRefs){
      lastBarBtn.current?.setChecked(true);
    }else{
      lastBarBtn.current?.setChecked(false);
    }
        
      
      
      
      lastBarBtn=BarBtnRefs;
    
    
    count++;
    */
  }
  async function onRemoveItemDel(_index:number,privatekey:string):Promise<boolean>{
      
      let server = await CallRustDelegate.GetServer();
      let owner = loginInfoStore.privatekey;
      let token = await JWT.read_token();
      let response = await SubAccountReq.DelSubAccounts(server,owner,privatekey,token);

      if(response.status==HttpReqeust.STATUS_OK){
        console.log("Delete item1:true");
        return true;
        
      }else{
        return false;
      }
  }

  function handleBack() {
    setCurrentFrame(FramePages.MainFrame);
  }

  async function handleFinish(account_info: AccountInfo,type:string) {
    if(ACCONT_FRAME_NAME[0]==type){
      AccountListExport.current?.CreateAccount({ mnemonic: account_info.mnemonic, account_name: account_info.account_name ,privatekey:""});
    } else if(ACCONT_FRAME_NAME[1]==type){
      AccountListExport.current?.CreateAccount({ mnemonic: account_info.mnemonic, account_name: account_info.account_name,privatekey:account_info.privatekey })
    }
    let privatekey = account_info.privatekey;
    if (privatekey==""){
      privatekey = await CryptoSupport.GenerateSolanaPrivateKey(account_info.mnemonic);
    }
    let server = await CallRustDelegate.GetServer();
    let ca:CreateSubAccountPayload={phrase:account_info.mnemonic, privatekey:privatekey, name:account_info.account_name,token:JWT.read_token()};
    SubAccountReq.CreateSubAccount(server,ca)
    setCurrentFrame(FramePages.MainFrame);
  }

  function onNetChange(selname: string) {
    console.log(selname);
  }

  return (

    <div className="MainFrame overflow-hidden">

      <Grid container spacing={0} sx={{ flexGrow: 1 }} className=" overflow-hidden">
        <Grid xs={3} className=" bg-gray-300 bg-opacity-10 MainFrameBar">

          <Grid container spacing={1} sx={{ flexGrow: 1 }}>
            <Grid xs={12} className="h-32">
              <NetSelBlock className=" w-[86%] h-24 mx-4" netname="SOLANA" icon={<img src={SolanaIcon} className=" w-8 h-8 brightness-80" />} onNetChange={onNetChange}></NetSelBlock>
            </Grid>
            {menuBars.map((item, index) => (
              <Grid key={index} xs={12} >
                <MenubarButton ref={BarBtnRefs.current[index]} className={item.className} title={item.title} icon={item.icon} checked={item.checked} onClick={() => MenubarOnClick(index)}></MenubarButton>
              </Grid>
            ))}

          </Grid>

        </Grid>
        <Grid xs={9}  >
          {/* account Framme */}
          <div className={`${CurrentFrame == FramePages.MainFrame ? "visible" : "hidden"}`}>
            <FrameAccountList ref={AccountListExport} onCreateAccount={handleCreateAccount} onImportAccount={handleImportAccount} onRemoveItem={onRemoveItemDel} />
          </div>
          <div className={`${CurrentFrame == FramePages.CreateAccount ? "visible" : "hidden"}`}>
            <FrameCreateAccount onBackBtnClick={handleBack} onFinish={handleFinish} name={ACCONT_FRAME_NAME[0]}/>
          </div>
          <div className={`${CurrentFrame == FramePages.ImportAccount ? "visible" : "hidden"}`}>
            <FrameImportAccount onBackBtnClick={handleBack} onFinish={handleFinish} name={ACCONT_FRAME_NAME[1]} />
          </div>

          {/* account Transfer */}
          <div className={`${CurrentFrame == FramePages.MainTranser ? "visible" : "hidden"}`}>
            <FrameTransfer onBackBtnClick={handleBack} onFinish={handleFinish} name={ACCONT_FRAME_NAME[1]} />
          </div>
        </Grid>

      </Grid>
    </div>

  );
}

export default MainFrame;
