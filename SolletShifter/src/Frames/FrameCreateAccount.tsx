import "./FrameCreateAccount.css"
import { Person, People} from "@mui/icons-material";
import { Box, Divider, Grid, Input, List, ListItem, ListItemDecorator, Radio, RadioGroup, Step, stepClasses, StepIndicator, stepIndicatorClasses, Stepper, Typography, typographyClasses } from "@mui/joy";
import { Fragment } from "react/jsx-runtime";

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AppRegistrationRoundedIcon from '@mui/icons-material/Swipe';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DoneAlldIcon from '@mui/icons-material/ListAltRounded';
import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import BackButton from "../componnet/BackButton";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";



import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";

import { CryptoSupport } from "../request/CryptoSupport";
import PhraseList, { PhraseListExport } from "../componnet/PhraseList";
import { AccountInfo } from "../commmon/common";
export interface ComponnetExportRef{

}
interface ComponnetRef{
    name:string;
    onBackBtnClick:()=>void;
    onFinish:(account_info:AccountInfo,type:string)=>void;
}


const FrameCreateAccount = forwardRef<ComponnetExportRef,ComponnetRef>((props,ref)=> {
    const [_mnemonic,setMnemonic] = useState<string>("");//bip39.generateMnemonic()
    const [AccountName,setAccountName] = useState<string>("");
    const SnackPopbarRef = useRef<SnackPopbarExportRef | null>(null);
    const [NextBtnTxt,setNextBtnTxt] = useState<string>("Next");
    const mPhraseList = useRef<PhraseListExport | null>(null);

    async function makePhrase()  {
  
        setMnemonic(await CryptoSupport.CreateMnemonic());
        
      }

      
   
  
    const {onBackBtnClick,onFinish,name}=props;
    const [currentStep,setStep]=useState(1);
    
    const PreviousBtn = useRef<DirectionButtonExportRef>(null);
    useImperativeHandle(ref,()=>({

    }));
    useEffect(()=>{
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
    useEffect(()=>{
        mPhraseList?.current?.setPhrase(mnemonic);
    },[mnemonic]);
     */

    function handlePrevious(_text:string){
        if(currentStep>2){
           
        }
        setStep(currentStep>1?currentStep-1:currentStep);
    }
    function handleNext(_text:string){

        if(currentStep<2){
            
            makePhrase();
            
            
            
        }
        if(currentStep==3){
            if(AccountName===""){
                showAlert("Please input Account Name");
                return;
            }
            setStep(1);
            //onFinish?.({mnemonic:mnemonic,account_name:AccountName});
            //slight convince worth multiply evil ecology harbor fly casino supply minimum arm
            onFinish?.({mnemonic:_mnemonic,privatekey:"",account_name:AccountName},name);
            
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
        await navigator.clipboard.writeText(_mnemonic);
        showAlert("Copy Secret Phrase success!!")
    }*/
    return (
        <Fragment>
            <Grid container spacing={0} sx={{ flexGrow: 1 }} >
            
                <Grid xs={12} className="flex justify-start items-end mt-4 ml-3">
                    <BackButton className="" onClick={()=>onBackBtnClick?.()}/>
                    <Typography level="h3" className="ml-[110px] text-blue-50 shadow-lg">Create Account</Typography>
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
                                    Create Account
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
                                    <RadioGroup defaultValue="One Account">
                                        <List
                                            sx={{
                                                minWidth: 110,
                                                '--List-gap': '1.5rem',
                                                '--ListItem-paddingY': '1rem',
                                                '--ListItem-radius': '32px',
                                                
                                            
                                            }}
                                        >
                                            {['One Account', 'Batch Creation'].map((item, index) => (
                                                <ListItem variant="solid" key={item} sx={{ bgcolor: `rgb(3 7 18 / var(--tw-bg-opacity))`}}>
                                                    <ListItemDecorator>
                                                        {[<Person />, <People />][index]}
                                                    </ListItemDecorator>
                                                    <Radio
                                                        overlay
                                                        value={item}
                                                        label={item}
                                                    
                                                        sx={{ flexGrow: 1, flexDirection: 'row-reverse',fontSize:"0.9rem" }}
                                                        slotProps={{

                                                            action: ({ checked }) => ({
                                                                sx: () => ({
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
                                    <PhraseList ref={mPhraseList} mnemonic={_mnemonic} title={"Please keep phrase"} haspaste={true} editable={false} phrasecount={12}/>
                                    {/*
                                    <Grid container spacing={0} sx={{ flexGrow: 1 }} className="">
                                            <Grid xs={12} className="mb-3 flex justify-center items-center">
                                                <Typography level="h3" > Secrect Recover Phrase</Typography>
                                                <ContentCopyIcon className="ml-2 hover:scale-105 active:scale-110 fill-current text-green-500 " onClick={handleCopyScKey}/>
                                            </Grid>
                                            
                                            
                                            {mnemonic.split(" ").map((v,i)=>(
                                                        <Grid xs={4} key={i} className="h-14 flex justify-center items-center mt">
                                                        <span className={(i>8?"-ml-5 px-[15px] ":"mr-4 ") + " mt-1"} >{i+1}.</span>
                                                        <Input size="sm"   value={v} className="w-24 h-4"/>
                                                        </Grid>
                                            ))}
                                            <Grid xs={12} className="">
   
                                                
                                            </Grid>
                                    </Grid>
                                     */}
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
export default FrameCreateAccount;