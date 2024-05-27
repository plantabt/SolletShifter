
import "./SnackPopbar.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';


import { forwardRef, useEffect, useImperativeHandle,  useState } from "react";
import PlaylistAddCheckCircleRoundedIcon from '@mui/icons-material/PlaylistAddCheckCircleRounded';
import { Snackbar } from "@mui/joy";


interface SnackPopbarProps {

    onClick?: (e:any) => void; // 点击事件处理器，可选属性

  }
  export interface SnackPopbarExportRef {
    Open:(b:boolean)=>void;
    setTitle:(text:string)=>void;
}
const SnackPopbar= forwardRef<SnackPopbarExportRef, SnackPopbarProps>((_props, ref)  => {  
    //const {onClick=null } = props;
    const [open, setOpen] = useState(false);
    const [tipInfo,setTipInfo]=useState<string>("");
    //const [combinedClassName,setCombinedClassName] = useState(`group SnackPopbar ${className}`);
    //const refCheckState = useRef(checked);

  
    //implement export functions
    useImperativeHandle(ref,()=>({

      Open:(b:boolean)=>{
        setOpen(b);
      },
      setTitle:(text:string)=>{
        setTipInfo(text);
      }
    }));



    useEffect(()=>{

      
    },[])

   
  return (
    <Snackbar
    variant="soft"
    color="success"
    open={open}
    onClose={() => setOpen(false)}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    startDecorator={<PlaylistAddCheckCircleRoundedIcon />}

  >
    {tipInfo}
  </Snackbar>
  );
});

export default SnackPopbar;
