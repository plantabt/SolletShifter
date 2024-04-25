import "./App.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';

import { useEffect } from "react";

import { useColorScheme } from '@mui/joy/styles';

import { appWindow } from "@tauri-apps/api/window";
import Title from "./Title";
import MainFrame from "./MainFrame";
import { Buffer } from 'buffer';
window.Buffer = Buffer;

//import axios from "axios";

//import { HttpReqeust } from "./request/HttpReqeust";

function App() {  
  const {  setMode } = useColorScheme();

  setMode('dark');
  useEffect(()=>{

    setTimeout(()=>{
      appWindow.show();
   
      //appWindow.setResizable(false);
    },1000);
  },[]);
 
  //"dismiss farm rice north drum pair rural usage deal badge metal volcano"
  //'http://127.0.0.1:9191/account/api/balance'
  //
/*
  function requestBalance(url:any,phrase:any,privekey:any=""){
    HttpReqeust.PostData(url, { phrase:phrase,privekey:privekey})
    .then(data => {
      console.log(data); // 从服务器解析的 JSON 数据
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  }
*/


  return (
    <div className="container">

          <Title />

          <MainFrame/>

    </div>
  );
}

export default App;
