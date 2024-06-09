import "./FrameTransfer.css"
import { Box, Checkbox, Grid, Sheet, SvgIconProps, Table } from "@mui/joy";
import { Fragment } from "react/jsx-runtime";


import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import { forwardRef, ReactElement, useEffect, useImperativeHandle, useRef, useState } from "react";



import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";

import { AccountInfo, formatText } from "../commmon/common";

import { SubAccount } from "../request/common";
export interface ComponnetExportRef{

}
interface ComponnetRef{
    name:string;
    subaccounts?:SubAccount[];
    onFinish:(account_info:AccountInfo,type:string)=>void;
}

interface SubAccountItem{
    name?: string,
    icon?: ReactElement<SvgIconProps>,
    balance?: number,
    privkey?: string,
  }
const FrameTransfer = forwardRef<ComponnetExportRef,ComponnetRef>((props,ref)=> {

    const {onFinish,name,subaccounts=null}=props;
    const [subAccountList,setSubAccountList] = useState<SubAccountItem[]>([]);
    const [mnemonic,setMnemonic] = useState<string>("");//bip39.generateMnemonic()
    const [AccountName,_setAccountName] = useState<string>("");
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
        setSubAccountList([]);
        subaccounts?.map((item)=>{
            setSubAccountList(oldparam=>[...oldparam,{name:item.name,privkey:item.privkey,phrase:item.phrase,balance:0.0}]);
        })
        console.log("Transfer SubAccounts:",subaccounts);
    },[subaccounts])

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
/*
    function handleChhangePrivateKey(event:ChangeEvent<HTMLTextAreaElement>){
        setPrivateKey(event.target.value)
    }

    function onPhraseChange(phrase:string){
        setMnemonic(phrase);
    }
*/
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
     /*
    function handleChangeAccountName(e:any){
        setAccountName(e.target.value);
    }
   
    async function handleCopyScKey(){
        await navigator.clipboard.writeText(mnemonic);
        showAlert("Past Secret Phrase success!!")

    }*/
    return (
        <Fragment>


            <Box className="mx-7 mt-12 h-[470px] w-[92%] rounded-t-xl rounded-b-xl BkgColor">

            <Grid spacing={0} sx={{ flexGrow: 1 }} className="h-[390px]">


                {/* table header */}
                <Grid xs={12} className="flex items-start">
                <Sheet className="mt-4 mx-4 w-[98%] overflow-y-auto overflow-x-hidden bg-gray-100 border-b rounded-t-md border-gray-500"  >
                    <Table stickyHeader  className="bg-gray-950 ">
                    <thead>
                        <tr >
                        <th className='w-20'><span className='ml-2'>Select</span></th>
                        <th className='w-40 text-center'>Name</th>
                        <th className='w-44'>Privkey</th>
                        <th>Balance</th>
                        </tr>
                    </thead>

                    </Table>
                </Sheet>
                </Grid>
                {/** table body */}
                <Grid xs={12} className="flex items-start ">
                <Sheet className="px-2 pr-2 mx-4 w-[98%] h-[340px] overflow-y-auto overflow-x-hidden bg-gray-700 rounded-b-md -mb-14 border-opacity-15 border-b-4 border-t-4 border-gray-700">
                    <Table >
                    <tbody >
                        {subAccountList.map((row, index) => (
                        <tr key={index} className="h-8 flex " >
                            <td className="w-16 rounded-l "><Checkbox size="sm" /></td>
                            <td className="w-40 justify-start">{row.name}</td>
                           
                            <td className=" rounded-r w-44 text-left"><span className="ml-2">{formatText(row.privkey?row.privkey:"",8)}</span></td>
                            <td className='h-8  flex items-center'><span className="ml-2">{row.icon}{row.balance}</span></td>
                        </tr>
                        ))}
                    </tbody>
                    </Table>
                </Sheet>
                </Grid>
                </Grid>


                    <Grid xs={12} className="flex justify-center">
                        <DirectionButton className="" ref={PreviousBtn} text="Previous" type={DirectionButtonType.Previous} disabled={true} onClick={handlePrevious}/>
 
                        <DirectionButton className="" text={NextBtnTxt} type={DirectionButtonType.Next} disabled={false} onClick={handleNext}/>
                    </Grid>
     
           
              
            </Box>
        <SnackPopbar ref={SnackPopbarRef} />
        </Fragment>
    );
});
export default FrameTransfer;