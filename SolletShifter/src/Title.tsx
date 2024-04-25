import "./Title.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';


import { Grid, Typography } from "@mui/joy";
import CloseIcon from '@mui/icons-material/Close';
import MinmmizeIcon from '@mui/icons-material/Minimize';
import { appWindow } from "@tauri-apps/api/window";
import { useState } from "react";
function Title() {  
  const [wintitle,setWintitle] = useState("") ;
  const [version,setVer] = useState("") ;
  
  async function getWindowTitle(){
    setWintitle( await appWindow.title());
    setVer("1.0.37");
    console.log(wintitle);
  }
  getWindowTitle();
 
  function closeWindow(){
    appWindow.close();
  }
  function miniWindow(){
    appWindow.minimize();
  }
  return (
    <div className="Title">
      
      <Grid container spacing={0} sx={{ flexGrow: 1}}>
        <Grid xs={11} data-tauri-drag-region className="h-24 bg-gray-300 bg-opacity-10 flex items-center">
          <Typography level="h2" data-tauri-drag-region className="caption">
            <span data-tauri-drag-region className="text-gray-50">{wintitle.substring(0,6)}</span>
            <span data-tauri-drag-region className="text-green-300">{wintitle.substring(6,-1)}</span>
            <span data-tauri-drag-region className="text-gray-300">  v{version}</span>
          </Typography>
        </Grid>
        <Grid xs={1} data-tauri-drag-region className=" h-24  bg-gray-300 bg-opacity-10 ">
          
          <MinmmizeIcon className="minmmize_btn" onClick={miniWindow}/>
          <CloseIcon className="close_btn" onClick={closeWindow}/>

        </Grid>
       
      </Grid>
      </div>
  );
}

export default Title;
