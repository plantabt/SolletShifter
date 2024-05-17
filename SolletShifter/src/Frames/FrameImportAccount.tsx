import "./FrameImportAccount.css"
import { Person, People, Apartment } from "@mui/icons-material";
import { Box, Button, Divider, Grid, Input, List, ListItem, ListItemDecorator, Radio, RadioGroup, Snackbar, Step, stepClasses, StepIndicator, stepIndicatorClasses, Stepper, Textarea, TextField, Typography, typographyClasses } from "@mui/joy";
import { Fragment } from "react/jsx-runtime";
import * as bip39 from "bip39"
import { mnemonicToSeedSync } from "bip39";
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AppRegistrationRoundedIcon from '@mui/icons-material/Swipe';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import SelectAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneAlldIcon from '@mui/icons-material/ListAltRounded';
import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import BackButton from "../componnet/BackButton";
import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";



import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";
import {TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { WalletSupport } from "../request/WalletSupport";
import PhraseList, { PhraseListExport } from "../componnet/PhraseList";
import { AccountInfo } from "../commmon/common";
export interface ComponnetExportRef{

}
interface ComponnetRef{

    name:string;
    onBackBtnClick:()=>void;
    onFinish:(account_info:AccountInfo,type:string)=>void;
}


const FrameImportAccount = forwardRef<ComponnetExportRef,ComponnetRef>((props,ref)=> {
    const [mnemonic,setMnemonic] = useState<string>("");//bip39.generateMnemonic()
    const [AccountName,setAccountName] = useState<string>("");
    const SnackPopbarRef = useRef<SnackPopbarExportRef>(null);
    const [NextBtnTxt,setNextBtnTxt] = useState<string>("Next");
    const [selectedRadio, setSelectedRadio] = useState<string | null>("");
    const [PrivateKey,setPrivateKey]=useState<string>("");
    let radioNames=["Secret Phrase","Private Key"];

      
   
  
    const {onBackBtnClick,onFinish,name}=props;
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

    function handlePrevious(text:string){
        if(currentStep>2){
           
        }
        setStep(currentStep>1?currentStep-1:currentStep);
    }
    function handleNext(text:string){

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
    async function handleCopyScKey(){
        await navigator.clipboard.writeText(mnemonic);
        showAlert("Past Secret Phrase success!!")

    }
    return (
        <Fragment>
            <Grid container spacing={0} sx={{ flexGrow: 1 }} >

                <Grid xs={12} className="flex justify-start items-end mt-4 ml-3">
                    <BackButton className="" onClick={()=>onBackBtnClick?.()}/>
                    <Typography level="h3" className="ml-[110px] text-blue-50 shadow-lg">Import Account</Typography>
                </Grid>
            </Grid>
            <Grid xs={12} className="mt-2">
                <Divider className=" bg-gray-50 ml-[10px] w-[97%] h-[3px] bg-opacity-30 shadow-md rounded-md"></Divider>
            </Grid>
            <Box className="mx-7 mt-4 h-[84%] w-[92%] ">
                <Grid container spacing={0} sx={{ flexGrow: 1 }}>



                    <Grid xs={12} className="flex justify-center  h-20 rounded-t-xl BkgColor">

                        <Stepper
                            orientation="horizontal"
                            sx={{
                                fontSize: '13px',
                                width: '500px',
                                '--Stepper-horizontalGap': '1.8rem',
                                '--StepIndicator-size': '1.8rem',
                                '--Step-gap': '1rem',
                                '--Step-connectorInset': '0.5rem',
                                '--Step-connectorRadius': '1rem',
                                '--Step-connectorThickness': '4px',

                                '--joy-palette-success-solidBg': 'var(--joy-palette-success-400)',
                                [`& .${stepClasses.completed}`]: {
                                    '&::after': { bgcolor: 'success.solidBg' },
                                },
                                [`& .${stepClasses.active}`]: {
                                    [`& .${stepIndicatorClasses.root}`]: {
                                        border: '4px solid',
                                        borderColor: '#fff',
                                        boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.primary[500]}`,
                                    },
                                },
                                [`& .${stepClasses.disabled} *`]: {
                                    color: 'neutral.softDisabledColor',
                                },
                                [`& .${typographyClasses['title-sm']}`]: {
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontSize: '10px',
                                },
                            }}
                        >
                            {/**disabled active completed*/}
                            <Step active={currentStep==1?true:false} indicator={
                                <StepIndicator variant="solid" color="success">
                                    {currentStep>1?  <CheckRoundedIcon />: <AppRegistrationRoundedIcon />}
                                </StepIndicator>
                            }>
                                <div>
                                    <Typography level="title-sm">Step 1</Typography>
                                    Choose Mode
                                </div>

                            </Step>

                            <Step active={currentStep==2?true:false} indicator={
                                <StepIndicator variant="solid" color={currentStep<2?"neutral":"success"}>
                                   
                                    {currentStep>2 ?  <CheckRoundedIcon />: <CreateRoundedIcon />}
                                </StepIndicator>
                            }>
                                <div>
                                    <Typography level="title-sm">Step 2</Typography>
                                    Input Key
                                </div>
                            </Step>
                            {/** 
                            <Step active={currentStep==3?true:false} indicator={
                                <StepIndicator variant="solid" color={currentStep<3?"neutral":"success"}>
                                  
                                    {currentStep>3 ?  <CheckRoundedIcon />: <SelectAllRoundedIcon />}
                                </StepIndicator>
                            }>
                                <div>
                                    <Typography level="title-sm">Step 3</Typography>
                                    Pick Currency
                                </div>
                            </Step>
*/}
                            <Step active={currentStep==3?true:false} indicator={
                                <StepIndicator variant="solid" color={currentStep<3?"neutral":"success"}>
                                    
                                    {currentStep>3 ?  <CheckRoundedIcon />: <DoneAlldIcon />}
                                </StepIndicator>
                            }>
                                <div>
                                    <Typography level="title-sm">Step 3</Typography>
                                    Finish
                                </div>
                            </Step>

                        </Stepper>
                    </Grid>


                    <Grid xs={12} >

                        <Grid container spacing={0} sx={{ flexGrow: 1 }} className="w-[100%] min-h-[280px] max-h-[280px] h-[280px] flex justify-center content-center BkgColor">
                            <Grid xs={12} className="mt-2 flex justify-center content-center">
                                <div className={currentStep==1?"visible":"hidden"}>
                                    <RadioGroup defaultValue={radioNames[0]}>
                                        <List
                                            sx={{
                                                minWidth: 110,
                                                '--List-gap': '1.5rem',
                                                '--ListItem-paddingY': '1rem',
                                                '--ListItem-radius': '32px',
                                                
                                            
                                            }}
                                        >
                                            {radioNames.map((item, index) => (
                                                <ListItem variant="solid" key={item} sx={{ bgcolor: `rgb(3 7 18 / var(--tw-bg-opacity))`}}>
                                                    <ListItemDecorator>
                                                        {[<Person />, <People />][index]}
                                                    </ListItemDecorator>
                                                    <Radio
                                                        overlay
                                                        value={item}
                                                        label={item}
                                                        onChange={() => {setSelectedRadio(item);}}
                                                        sx={{ flexGrow: 1, flexDirection: 'row-reverse',fontSize:"0.9rem" }}
                                                        slotProps={{

                                                            action: ({ checked }) => ({
                                                                sx: (theme) => ({
                                                                    ...(checked && {
                                                                        inset: -1,
                                                                        //border: '2px solid',
                                                                        //borderColor: theme.vars.palette.primary[400],
                                                                        //backgroundColor:'red'
                                                                    }),
                                                                }),
                                                            }),
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </RadioGroup>
                                </div>
                                {/** create account*/}
                                <div className={(currentStep==2?"visible":"hidden")+ " mt-2 w-[70%]"} >
                                    <Grid container spacing={0} sx={{ flexGrow: 1 }} className={`${selectedRadio==radioNames[1]?"visible":"hidden"} flex items-center justify-center`}>
                                        <Grid xs={6} className="">
                                            <Typography level="h3" className="mb-4">PrivateKey:</Typography>
                                        </Grid>
                                        <Grid xs={6} className="w-[500px]">
                                            <Textarea maxRows={4} minRows={4} value={PrivateKey} className="" onChange={(event)=>handleChhangePrivateKey(event)}/>

                                        </Grid>
                                    </Grid>   
                                    <PhraseList  mnemonic={mnemonic} onChange={onPhraseChange} className={`${selectedRadio==radioNames[0]?"visible":"hidden"}`} title={"Input Phrase"} haspaste={false} editable={true} phrasecount={12}/>
                                </div>
                                {/** finish*/}
                                <div className={(currentStep==3?"visible":"hidden")+ " -mt-20"} >
                                    <Grid container spacing={0} sx={{ flexGrow: 1 }} className="">
                                        <Grid xs={12} className="">
                                            <Typography level="h3" className="mb-4">Input Account Name:</Typography>
                                            <Input size="sm" type="text"  value={AccountName} onChange={handleChangeAccountName} className=""/>
                                        </Grid>
                                    </Grid>
                                </div>
                            </Grid>


                        </Grid>

                            <Grid container spacing={0} sx={{ flexGrow: 1 }} className="w-[100%] min-h-[84px] max-h-[84px] h-[84px]  rounded-b-xl flex justify-center BkgColor">
                                <Grid xs={5} className=""></Grid>
                                <Grid xs={1} >
                                    <DirectionButton className="" ref={PreviousBtn} text="Previous" type={DirectionButtonType.Previous} disabled={true} onClick={handlePrevious}/>
                                </Grid>
                                <Grid xs={1} >
                                    <DirectionButton className="" text={NextBtnTxt} type={DirectionButtonType.Next} disabled={false} onClick={handleNext}/>
                                </Grid>
                                <Grid xs={5} className=""></Grid>
                            </Grid>   
                    </Grid>
                </Grid>
            </Box>
        <SnackPopbar ref={SnackPopbarRef} />
        </Fragment>
    );
});
export default FrameImportAccount;