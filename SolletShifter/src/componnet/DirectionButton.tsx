import "./DirectionButton.css"
import { forwardRef, useImperativeHandle, useState } from "react";
import PreviousBkg from "../assets/imgs/PreviousBkg.png"
import NextBkg from "../assets/imgs/NextBkg.png"
import PreviousIcon from "../assets/imgs/PreviousIcon.png"
import NextIcon from "../assets/imgs/NextIcon.png"
export enum DirectionButtonType{
    Next=0,
    Previous
}
interface ComponnetProps{
    className:string;
    text:string;
    type:DirectionButtonType;
    disabled:boolean;
    onClick:(text:string)=>void;
}

export interface DirectionButtonExportRef{
    setDisabled:(b:boolean)=>void;
}
const DirectionButton = forwardRef<DirectionButtonExportRef,ComponnetProps>((props,ref)=>{
    
    const {className="",text="",type=DirectionButtonType.Next,disabled,onClick}=props;
    const [isDisabled,setDisabled] = useState(disabled);
    const combinClass = className + ` group  DirectionBtn ` + (isDisabled?"DirectionButtonDisabled":"");
    const classBtnText =  (isDisabled?"DirectionButtonTextDisabled":" DirectionButtonText");
    const DirectionIcon = (type==0?NextIcon:PreviousIcon)
    const commonBkg = (type==0?NextBkg:PreviousBkg)
    const commPos = (type==0?'center center,104px 10px':'center,8px 10px')
    useImperativeHandle(ref,()=>({
        setDisabled:(b:boolean)=>{
            setDisabled(b);
        }
    }));
    function handleClick(text:string){
        if(isDisabled==false){
            onClick?.(text);
        }
    }
    return(
<div style={{backgroundImage: `url(${commonBkg}),url(${DirectionIcon})`,backgroundSize: '105px 36px,22px 22px',backgroundRepeat: 'no-repeat,no-repeat',backgroundPosition: commPos,}} className={combinClass} onClick={()=>{handleClick(text)}}><span className={classBtnText}>{text}</span></div>
    );
});
export default DirectionButton;