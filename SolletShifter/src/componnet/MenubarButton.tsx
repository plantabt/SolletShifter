import "./MenubarButton.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';

import {  SvgIconProps } from "@mui/joy";
import { forwardRef, ReactElement, useEffect, useImperativeHandle,  useState } from "react";


interface ButtonProps {
    title: string;      // 按钮显示的文字
    onClick?: (e:any) => void; // 点击事件处理器，可选属性
    className?:string;
    icon:ReactElement<SvgIconProps>;
    checked:boolean;

  }
  export interface ButtonRef {
    setChecked: (checked: boolean) => void;
    getChecked: () => boolean;
    getTitle:()=>string;
}
const MenubarButton= forwardRef<ButtonRef, ButtonProps>((props, ref)  => {  
    const { title, onClick, className = '', icon, checked } = props;
 
    const [checkState,setCheckState] = useState(checked);
    const [combinedClassName,setCombinedClassName] = useState(`MenubarButton ${className}`);
    //const refCheckState = useRef(checked);


    //implement export functions
    useImperativeHandle(ref,()=>({
      setChecked:(bcheck:boolean)=>{
        console.log(`MenubarButton:setChecked(${bcheck})`);
        setCheckState(bcheck);
      },
      getChecked:()=>{
        return checked;
      },
      getTitle:()=>{
        return title;
      }
    }));

    function handleOnclick(e:any){
      let newChecked = !checkState;
      setCheckState(newChecked);
      onClick?.(e);
    }
    
    function setCheck(bcheck:boolean){
        setCombinedClassName(bcheck ? `MenubarButton ${className} MenubarButtonFocus` : `MenubarButton ${className}`);
    }
    useEffect(()=>{
      //console.log(`useEffect:${title}->${checkState}`);
      //if(refCheckState.current!=checkState){
        setCheck(checkState);
       // refCheckState.current = checkState;
     // }
      
    },[checkState])

   
  return (
    <div  className={combinedClassName} onClick={handleOnclick}>
        <div className="icon">{icon}</div>
        <span >
        {title}
        </span>
    </div>
  );
});

export default MenubarButton;
