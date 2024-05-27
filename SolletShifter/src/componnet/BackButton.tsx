import { forwardRef } from "react";
import "./BackButton.css"
import BackBtn from "../assets/imgs/BackBtn.png"
interface ComponnetProps{
    className:string;
    onClick:()=>void;
}
export interface ComponnetExportRef{

}

const BackButton = forwardRef<ComponnetExportRef,ComponnetProps> ((props,_ref)=>{
    const {className="",onClick} = props;
    const newClass = className + "group w-[124px] h-[30px] flex justify-center items-center BackButton";
return(
    <div style={{backgroundImage: `url(${BackBtn})`,backgroundSize: 'cover',backgroundRepeat: 'no-repeat'}} className={newClass} onClick={()=>onClick?.()}><span className="BackButtonText" >Back</span></div>
);
});


export default BackButton;