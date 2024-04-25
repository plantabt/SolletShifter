
import "./IconButtonEx.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';

import AccountButtonBkg from '../assets/imgs/AccountButtonBkg.png'
import { forwardRef, ReactElement, useEffect, useImperativeHandle,  useState } from "react";


interface IconButtonExProps {
    text: string;
    onClick?: (e:any) => void; // 点击事件处理器，可选属性
    className?:string;
    iconPath:string;
    id:string
  }
  export interface IconButtonExRef {
    setChecked: (checked: boolean) => void;
    getChecked: () => boolean;
    getTitle:()=>string;
}
const IconButtonEx= forwardRef<IconButtonExRef, IconButtonExProps>((props, ref)  => {  
    const { text="", onClick=null, className = '', iconPath="", id=""} = props;

    const [combinedClassName,setCombinedClassName] = useState(`group IconButtonEx ${className}`);
    //const refCheckState = useRef(checked);


    //implement export functions
    useImperativeHandle(ref,()=>({
      setChecked:(bcheck:boolean)=>{
        console.log(`IconButtonEx:setChecked(${bcheck})`);

      },
      getChecked:()=>{
        return false;
      },
      getTitle:()=>{
        return text;
      }
    }));

    function handleOnclick(e:any){

      onClick?.(e);
    }
    

    useEffect(()=>{

      
    },[])

   
  return (
    <div id={id} onClick={handleOnclick} style={{backgroundImage: `url(${AccountButtonBkg}),url(${iconPath})`,backgroundSize: '140px 40px,24px 24px',backgroundRepeat: 'no-repeat,no-repeat',backgroundPosition: '4px 6px,left top'}} className={combinedClassName}>
        <span className='IconBtnText'>{text}</span>
    </div>
  );
});

export default IconButtonEx;
