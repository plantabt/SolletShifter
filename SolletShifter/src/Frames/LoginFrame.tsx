import "./LoginFrame.css"
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { ChangeEvent, forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Grid, Input, List, ListItem, ListItemDecorator, Radio, RadioGroup, Textarea } from '@mui/joy';
import { AddBox, Https, Key, People, Person } from '@mui/icons-material';
import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import PhraseList from "../componnet/PhraseList";
import { WalletSupport } from "../request/WalletSupport";
import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";
interface ComponnetRef{

}
export interface LoginFrameExportRef{
    open:(bOpen:boolean)=>void;
}
const LoginFrame = forwardRef<LoginFrameExportRef,ComponnetRef>((props,ref)=> {
    enum RadioNames{
        SecretPhrase = "Secret Phrase",
        PrivateKey = "Private Key",
        CreateAccount = "Create Account"
    }
    enum StepNames{
        SelectMode=0,
        InputData,
        InputName,
        Confirm,
        MAX_STEP
    }
 
    const [currentPage, setCurrentPage] = useState<number>(0);

    const radioNames=[RadioNames.SecretPhrase,RadioNames.PrivateKey,RadioNames.CreateAccount]; 
    const [NextBtnTxt,setNextBtnTxt] = useState<string>("Next");
    const [selectedRadio, setSelectedRadio] = useState<string | "">("");
    const [privateKey,setPrivateKey]=useState<string>("");
    const [mnemonic,setMnemonic]=useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [account_name,setAccountName]=useState<string | "">("");
    const SnackPopbarRef = useRef<SnackPopbarExportRef>(null);
    useImperativeHandle(ref,()=>({
        open:(bOpen:boolean)=>{
            setOpen(bOpen);
        }
    }));
    useEffect(()=>{
        
        if(currentPage>StepNames.SelectMode){
            
            PreviousBtn.current?.setDisabled(false);
        }else if(currentPage==0){
            PreviousBtn.current?.setDisabled(true);
        }
        
        if(currentPage==StepNames.InputData){
            if(selectedRadio==RadioNames.CreateAccount){
                makePhrase();
            }
        }
        if(currentPage==StepNames.InputName){
            switch(selectedRadio){
                case RadioNames.CreateAccount:
                    
                break;
            }
        }

    },[currentPage,selectedRadio]);

    useEffect(()=>{
        console.log(selectedRadio);
    },[selectedRadio]);

    const PreviousBtn = useRef<DirectionButtonExportRef>(null);

    async function makePhrase () {
        setMnemonic(await WalletSupport.CreateMnemonic());
      };

      
    function handlePrevious(text:string){
        setCurrentPage(oldvalue=>oldvalue>0?oldvalue-1:oldvalue);
    }
    function handleNext(text:string){
        if(selectedRadio==""){
            setSelectedRadio(radioNames[0]);
        }
        if(currentPage==StepNames.InputName){
            switch(selectedRadio){
                case RadioNames.CreateAccount:
                    if(account_name==""){
                        showAlert("Please input name");
                        return;
                    }
                break;
            }
        }
        setCurrentPage(oldvalue=>oldvalue<StepNames.MAX_STEP-1?oldvalue+1:oldvalue);

    }
    function handlePhraseChange(event:ChangeEvent){
    }
    function handleTextChange(event:ChangeEvent<HTMLTextAreaElement>){
        setPrivateKey(event.target.value);
    }
    function handleAccountNameChange(event:ChangeEvent<HTMLInputElement>){
        setAccountName(event.target.value);
    }
    function showAlert(info:string){
        console.log("showAlert:",info);
        SnackPopbarRef.current?.setTitle(info)
        SnackPopbarRef.current?.Open(true);
    }
  return (
    <Fragment>

      <Modal
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        open={open}
        onClose={(_event: React.MouseEvent<HTMLButtonElement>, reason: string) => {
           if(reason=="closeClick"){
            setOpen(false);
           }
          }}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Sheet
        data-tauri-drag-region
            className="Sheet"
          variant="outlined"
          sx={{
            maxWidth: 500,
            minWidth: 500,
            maxHeight: 500,
            minHeight: 500,            
            borderRadius: 'md',
            p: 3,
            boxShadow: 'lg',
          }}
        >
          <ModalClose variant="plain" className="max-w-[24px] min-w-[24px] max-h-[24px] min-h-[24px]" />
          <Typography
          data-tauri-drag-region
            component="h2"
            id="modal-title"
            level="h4"
            textColor="inherit"
            fontWeight="lg"
            mb={1}
            className="flex justify-center items-center"
          >
            Login
          </Typography>
          <br/>
            
            
          <div className={`${currentPage==0?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
          <br/>
          <Grid container spacing={0} sx={{ flexGrow: 1 }} >

            <Grid xs={12} className="flex justify-center">
             
            <RadioGroup defaultValue={radioNames[0]}>
                                        <List
                                            sx={{
                                                minWidth: 110,
                                                '--List-gap': '1.0rem',
                                                '--ListItem-paddingY': '1rem',
                                                '--ListItem-radius': '32px',
                                                
                                            
                                            }}
                                            className="flex justify-center"
                                        >
                                            {radioNames.map((item, index) => (
                                                <ListItem variant="solid" key={item} sx={{ bgcolor: `rgb(3 7 18 / var(--tw-bg-opacity))`}}>
                                                    <ListItemDecorator>
                                                        {[<Https />, <Key />,<AddBox />][index]}
                                                    </ListItemDecorator>
                                                    <Radio
                                                        overlay
                                                        value={item}
                                                        label={item}
                                                        onChange={() => {setSelectedRadio(item);}}
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
            </Grid>
        </Grid>

        </div>
        <div className={`${currentPage==1?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
  

          <Grid container spacing={0} sx={{ flexGrow: 1 }} >

            <Grid xs={12} className="flex justify-center">
            <div className={`${radioNames[0]==selectedRadio?"visible":"hidden"}`}>
                <PhraseList  className="" title="Input Secret Phrase" haspaste={false} editable={true} phrasecount={12} mnemonic={""}/>            
            </div>
           
            <div className={`${radioNames[1]==selectedRadio?"visible":"hidden"} flex items-center h-[250px]`}>
                
                <Grid container spacing={0} sx={{ flexGrow: 1 }} className={``}>
                    <Grid xs={12} className="flex items-center justify-center">
                        <Typography level="h3" className="mb-4">PrivateKey:</Typography>
                    </Grid>
                    <Grid xs={12} className="">
                        <Textarea maxRows={4} minRows={4} value={privateKey} onChange={handleTextChange}/>

                    </Grid>
                </Grid>   
            </div>
            <div className={`${radioNames[2]==selectedRadio?"visible":"hidden"}`}>
                <PhraseList className="" title="Please keep your Phrase" haspaste={true} editable={false} phrasecount={12} mnemonic={mnemonic}/>
            </div>
            </Grid>
        </Grid>
        </div>
        <div className={`${currentPage==2?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
          <br/>
          <br/>
          <br/>

            <Grid container spacing={0} sx={{ flexGrow: 1 }} className="">
                    <Grid xs={12} className="flex justify-center">
                        <Typography level="h3" className="mb-4">Input name:</Typography>
                    </Grid>
                    
                    <Grid xs={2} className=""></Grid>
                    <Grid xs={8} className="">
                        <Input type="input" value={account_name} onChange={handleAccountNameChange}/>

                    </Grid>
                    <Grid xs={2} className=""></Grid>
             </Grid>   
  
        </div>
        <Grid container spacing={0} sx={{ flexGrow: 1 }} className="rounded-b-xl flex justify-center">
           
            <Grid xs={6} >
                <DirectionButton className="" ref={PreviousBtn} text="Previous" type={DirectionButtonType.Previous} disabled={true} onClick={handlePrevious}/>
            </Grid>
            <Grid xs={6} >
                <DirectionButton className="" text={NextBtnTxt} type={DirectionButtonType.Next} disabled={false} onClick={handleNext}/>
            </Grid>
            
        </Grid>   
        
        </Sheet>
        
      </Modal>
      <SnackPopbar ref={SnackPopbarRef} />
    </Fragment>
  );
});
export default LoginFrame;