import "./MainFrame.css";
import "./styles.css";
import '@fontsource/inter';
import 'tailwindcss/tailwind.css';
import { createRef, useEffect, useRef, useState } from "react";
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



const menuBars = [
  { title: "Account", icon: <WalletIcon />, className: " MainFramBarButton", checked: true },
  { title: "Transfer", icon: <MoveUpIcon />, className: " MainFramBarButton", checked: false },
  { title: "Exchange", icon: <ExchangeIcon />, className: " MainFramBarButton", checked: false },
  { title: "Help", icon: <HelpIcon />, className: " MainFramBarButton", checked: false }
];
enum FramePage {
  MainFrame = 0,
  CreateAccount,
  ImportAccount,
  MoreDetails
}

function MainFrame() {
  const [CurrentFrame, setCurrentFrame] = useState(FramePage.MainFrame);
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
    setTimeout(() => {
      setLastBarBtn(BarBtnRefs.current[0]?.current);
    }, 1000);
  }, []);
  function handleCreateAccount() {
    setCurrentFrame(FramePage.CreateAccount);
    //setAccountCards(currentCards=>[...currentCards,dataSource]);
  }
  function handleImportAccount() {
    setCurrentFrame(FramePage.ImportAccount);
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
  function handleBack() {
    setCurrentFrame(FramePage.MainFrame);
  }
  function handleFinish(account_info: AccountInfo,type:string) {
    if(ACCONT_FRAME_NAME[0]==type){
      AccountListExport.current?.CreateAccount({ mnemonic: account_info.mnemonic, account_name: account_info.account_name ,privatekey:""});
    } else if(ACCONT_FRAME_NAME[1]==type){
      AccountListExport.current?.CreateAccount({ mnemonic: account_info.mnemonic, account_name: account_info.account_name,privatekey:account_info.privatekey })
    }
    setCurrentFrame(FramePage.MainFrame);
  }

  function onNetChange(selname: string) {
    console.log(selname);
  }

  return (
    <div className="MainFrame overflow-hidden">
      
      {/**
<Button variant="soft" onClick={() => {
  setMode(mode === 'light' ? 'dark' : 'light');
}}>asdfsdf</Button>
 */}
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

            {/**
                <Grid xs={12} >
                    <MenubarButton className=" w-[84%] h-10 mx-5" title="Account" icon={<WalletIcon />}></MenubarButton>
                </Grid>
                <Grid xs={12} >
                    <MenubarButton className=" w-[84%] h-10 mx-5" title="Transfer" icon={<MoveUpIcon/>}></MenubarButton>
                </Grid>
                <Grid xs={12} >
                    <MenubarButton className=" w-[84%] h-10 mx-5" title="Exchange" icon={<ExchangeIcon/>}></MenubarButton>
                </Grid>
                 */}
          </Grid>

        </Grid>
        <Grid xs={9}  >
          <div className={CurrentFrame == FramePage.MainFrame ? "visible" : "hidden"}>
            <FrameAccountList ref={AccountListExport} onCreateAccount={handleCreateAccount} onImportAccount={handleImportAccount}  />
          </div>
          <div className={CurrentFrame == FramePage.CreateAccount ? "visible" : "hidden"}>
            <FrameCreateAccount onBackBtnClick={handleBack} onFinish={handleFinish} name={ACCONT_FRAME_NAME[0]}/>
          </div>
          <div className={CurrentFrame == FramePage.ImportAccount ? "visible" : "hidden"}>
            <FrameImportAccount onBackBtnClick={handleBack} onFinish={handleFinish} name={ACCONT_FRAME_NAME[1]} />
          </div>
        </Grid>

      </Grid>
    </div>
  );
}

export default MainFrame;
