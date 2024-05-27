import "./Title.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';


import { Button, Grid, Typography } from "@mui/joy";
import CloseIcon from '@mui/icons-material/Close';
import MinmmizeIcon from '@mui/icons-material/Minimize';
import { appWindow } from "@tauri-apps/api/window";
import { useEffect, useRef, useState } from "react";
import LoginFrame, { LoginFrameExportRef } from "./Frames/LoginFrame";
import { CallRustDelegate } from "./commmon/CallRustDelegate";
function Title() {  
  const [wintitle,setWintitle] = useState("") ;
  const [version,setVer] = useState("") ;
  
  async function getWindowTitle(){
    setWintitle( await appWindow.title());
    
    setVer(await CallRustDelegate.GetVersion());
    console.log("windowtitle:",wintitle,wintitle.substring(0,6),wintitle.substring(6,wintitle.length));
  }
  getWindowTitle();
 
  function closeWindow(){
    appWindow.close();
  }
  function miniWindow(){
    appWindow.minimize();
  }

  useEffect(()=>{
    
  },[]);
  const loginFrame = useRef<LoginFrameExportRef | null>(null);

  return (
    <div className="Title">
      
      <Grid container spacing={0} sx={{ flexGrow: 1}}>
        <Grid xs={11} data-tauri-drag-region className="h-24 bg-gray-300 bg-opacity-10 flex items-center">
          <Typography level="h2" data-tauri-drag-region className="caption">
            <span data-tauri-drag-region className="text-gray-50">{wintitle.substring(0,6)}</span>
            <span data-tauri-drag-region className="text-green-300">{wintitle.substring(6,wintitle.length)}</span>
            <span data-tauri-drag-region className="text-gray-300">  v{version}</span>
            
          </Typography>
        </Grid>
        <Grid xs={1} data-tauri-drag-region className=" h-24  bg-gray-300 bg-opacity-10 ">
          
          <MinmmizeIcon className="minmmize_btn" onClick={miniWindow}/>
          <CloseIcon className="close_btn" onClick={closeWindow}/>
          
          <Button onClick={()=>loginFrame.current?.open(true)} variant="outlined" className="text-[12px] h-[26px] min-h-[26px] max-h-[26px]">Login</Button>
        </Grid>
       
      </Grid>
      <LoginFrame ref={loginFrame}/>
      </div>
  );
}

export default Title;
