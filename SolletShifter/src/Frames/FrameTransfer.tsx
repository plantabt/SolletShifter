import "./FrameTransfer.css"
import { Person, People} from "@mui/icons-material";
import { Box, Divider, Grid, Input, List, ListItem, ListItemDecorator, Radio, RadioGroup, Sheet, Step, stepClasses, StepIndicator, stepIndicatorClasses, Stepper, Table, Textarea, Typography, typographyClasses } from "@mui/joy";
import { Fragment } from "react/jsx-runtime";

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AppRegistrationRoundedIcon from '@mui/icons-material/Swipe';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';

import DoneAlldIcon from '@mui/icons-material/ListAltRounded';
import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import BackButton from "../componnet/BackButton";
import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";



import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";

import PhraseList from "../componnet/PhraseList";
import { AccountInfo, MintItem } from "../commmon/common";
export interface ComponnetExportRef{

}
interface ComponnetRef{

    name:string;
    onBackBtnClick:()=>void;
    onFinish:(account_info:AccountInfo,type:string)=>void;
}


const FrameTransfer = forwardRef<ComponnetExportRef,ComponnetRef>((props,ref)=> {
    const {onBackBtnClick,onFinish,name}=props;
    const [rows,_setRows] = useState<MintItem[]>([]);
    const [mnemonic,setMnemonic] = useState<string>("");//bip39.generateMnemonic()
    const [AccountName,setAccountName] = useState<string>("");
    const SnackPopbarRef = useRef<SnackPopbarExportRef>(null);
    const [NextBtnTxt,setNextBtnTxt] = useState<string>("Next");
    const [selectedRadio, setSelectedRadio] = useState<string | null>("");
    const [PrivateKey,setPrivateKey]=useState<string>("");
    let radioNames=["Secret Phrase","Private Key"];

      
   
  
    
    const [currentStep,setStep]=useState(1);
    
    const PreviousBtn = useRef<DirectionButtonExportRef>(null);
    //const mPhraseList = useRef<PhraseListExport>(null);

    useImperativeHandle(ref,()=>({

    }));
    useEffect(()=>{
        //mPhraseList.current?.setPhrase(mnemonic);
        if(currentStep==1){

            if(selectedRadio==""){
                setSelectedRadio(radioNames[0]);
            }
        }
        if(currentStep>1){
            
            PreviousBtn.current?.setDisabled(false);
        }else{
            PreviousBtn.current?.setDisabled(true);
        }
        if(currentStep>2){
            setNextBtnTxt("Finish");
        }else{
            setNextBtnTxt("Next");
        }
    },[currentStep]);

    function handleChhangePrivateKey(event:ChangeEvent<HTMLTextAreaElement>){
        setPrivateKey(event.target.value)
    }

    function onPhraseChange(phrase:string){
        setMnemonic(phrase);
    }

    function handlePrevious(_text:string){
        if(currentStep>2){
           
        }
        setStep(currentStep>1?currentStep-1:currentStep);
    }
    function handleNext(_text:string){

        if(currentStep<2){
            console.log("mnemonic clear");
            setMnemonic("");
            setPrivateKey("");
            
            if(selectedRadio==radioNames[0]){//secret phrase
                
            }else if(selectedRadio==radioNames[1]){//private key
                
            }
        }
        if(currentStep==2){
            console.log(selectedRadio);
           
            if(selectedRadio==radioNames[0]){
                if(mnemonic.length<=12*3){
                    showAlert("Please input 12 Secret Phrase!")
                    return;
                
                }
            }else if(selectedRadio==radioNames[1]){
                if(PrivateKey.length<32){
                    showAlert("Please input Private Key!")
                    return;
                
                }
            }

        }
        if(currentStep==3){
            
            //onFinish?.({mnemonic:mnemonic,account_name:AccountName});
            //slight convince worth multiply evil ecology harbor fly casino supply minimum arm
            if(AccountName==""){
                showAlert("Please input Account Name")

                return;
            
            }
            setStep(1);
            onFinish?.({mnemonic:mnemonic,privatekey:PrivateKey,account_name:AccountName},name);
            
        }else{
            setStep(currentStep<4?currentStep+1:currentStep);
        }
        

    }
    function showAlert(info:string){
        SnackPopbarRef.current?.setTitle(info)
        SnackPopbarRef.current?.Open(true);
    }
    function handleChangeAccountName(e:any){
        setAccountName(e.target.value);
    }
    /*
    async function handleCopyScKey(){
        await navigator.clipboard.writeText(mnemonic);
        showAlert("Past Secret Phrase success!!")

    }*/
    return (
        <Fragment>


            <Box className="mx-7 mt-12 h-[450px] w-[92%] rounded-t-xl rounded-b-xl BkgColor">

            <Grid spacing={0} sx={{ flexGrow: 1 }}>


                {/* table header */}
                <Grid xs={12} className="flex items-start mt-2">
                <Sheet className="mx-4 w-[92%]  h-6 overflow-y-auto overflow-x-hidden bg-gray-700 border-b rounded-t-md border-gray-500"  >
                    <Table stickyHeader className="bg-gray-700 ">
                    <thead>
                        <tr >
                        <th className='w-16'><span className='ml-2'>Name</span></th>
                        <th className='w-24'>Balance</th>
                        <th>Token</th>
                        </tr>
                    </thead>

                    </Table>
                </Sheet>
                </Grid>
                {/** table body */}
                <Grid xs={12} className="flex items-start h-28">
                <Sheet className="px-2 pr-2 mx-4 w-[92%] h-28 overflow-y-auto overflow-x-hidden bg-gray-700 rounded-b-md -mb-14 border-opacity-15 border-b-4 border-t-4 border-gray-700">
                    <Table >
                    <tbody >
                        {rows.map((row, index) => (
                        <tr key={index} className="h-8">
                            <td className="w-16 rounded-l "><span className='-ml-3'>{row.name}</span></td>
                            <td className='h-8  flex items-center'>{row.icon}{row.balance}</td>
                            <td className=" rounded-r "><span className='overflow-ellipsis whitespace-nowrap overflow-hidden'>{row.token}</span></td>
                        </tr>
                        ))}
                    </tbody>
                    </Table>
                </Sheet>
                </Grid>
                </Grid>

                <Grid container spacing={0} sx={{ flexGrow: 1 }} className="w-[100%] min-h-[84px] max-h-[84px] h-[84px]  rounded-b-xl flex justify-center ">
                    <Grid xs={5} className=""></Grid>
                    <Grid xs={1} >
                        <DirectionButton className="" ref={PreviousBtn} text="Previous" type={DirectionButtonType.Previous} disabled={true} onClick={handlePrevious}/>
                    </Grid>
                    <Grid xs={1} >
                        <DirectionButton className="" text={NextBtnTxt} type={DirectionButtonType.Next} disabled={false} onClick={handleNext}/>
                    </Grid>
                    <Grid xs={5} className=""></Grid>
                </Grid>   
           
              
            </Box>
        <SnackPopbar ref={SnackPopbarRef} />
        </Fragment>
    );
});
export default FrameTransfer;