import "./LoginFrame.css"
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import { ChangeEvent, forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Grid, Input, List, ListItem, ListItemDecorator, Radio, RadioGroup, Textarea } from '@mui/joy';
import { AddBox, Https, Key } from '@mui/icons-material';
import DirectionButton, { DirectionButtonExportRef, DirectionButtonType } from "../componnet/DirectionButton";
import PhraseList from "../componnet/PhraseList";
import { CryptoSupport } from "../request/CryptoSupport";
import SnackPopbar, { SnackPopbarExportRef } from "../componnet/SnackPopbar";
import { CallRustDelegate } from "../commmon/CallRustDelegate";
import { HttpReqeust } from "../request/HttpReqeust";
import { JWT } from "../JWT";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { login, logout } from "../store/modules/LoginInfoStore";

interface ComponnetRef{
    onLoggedin:(name:String)=>void;
}
export interface LoginFrameExportRef{
    
    open:(bOpen:boolean)=>void;
}
const LoginFrame = forwardRef<LoginFrameExportRef,ComponnetRef>((props,ref)=> {
    const {onLoggedin}=props;
    const changeLoginStore = useDispatch();
    
    
    enum RadioNames{
        SecretPhrase = "Secret Phrase",
        PrivateKey = "Private Key",
        CreateAccount = "Create Account"
    }
    enum StepNames{
        SelectMode=0,
        MakePhrase,
        InputPhrase,
        InputPrivkey,
        InputName,
        LoginFinish,
        RegFinish,
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
    const [responseInfo,setResponseInfo] = useState<string[]>([]);

    useImperativeHandle(ref,()=>({
        open:(bOpen:boolean)=>{
            setOpen(bOpen);
        }
    }));
    useEffect(()=>{
        if(selectedRadio==""){
            setSelectedRadio(RadioNames.SecretPhrase);
        }
      
    },[currentPage,selectedRadio]);

    useEffect(()=>{

    },[responseInfo]);

    const PreviousBtn = useRef<DirectionButtonExportRef>(null);

    async function makePhrase () {
        setMnemonic(await CryptoSupport.CreateMnemonic());
      };

      
    function handlePrevious(_text:string){
        //setCurrentPage(oldvalue=>oldvalue>0?oldvalue-1:oldvalue);
        switch(selectedRadio){
            case RadioNames.CreateAccount:
                switch(currentPage){
                    case StepNames.MakePhrase:
                        PreviousBtn.current?.setDisabled(true);
                        setMnemonic("");
                        setCurrentPage(StepNames.SelectMode);
                        break;
                    case StepNames.InputName:
                        setCurrentPage(StepNames.MakePhrase);
                    break;
                    case StepNames.RegFinish:
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.InputName);
                    break;
                    /*
                    case StepNames.RegFinish:
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.Confirm);
                    break;
                    */
                }
            break;
            case RadioNames.SecretPhrase:
                switch(currentPage){
                    case StepNames.InputPhrase:
                        PreviousBtn.current?.setDisabled(true);
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.SelectMode);
                        break;

                    case StepNames.LoginFinish:
                        setCurrentPage(StepNames.InputPhrase);
                    break;
                    /*
                    case StepNames.RegFinish:
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.Confirm);
                    break;
                    */
                }
            break;
            case RadioNames.PrivateKey:
                switch(currentPage){
                    case StepNames.InputPrivkey:
                        PreviousBtn.current?.setDisabled(true);
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.SelectMode);
                        break;

                    case StepNames.LoginFinish:
                        setCurrentPage(StepNames.InputPrivkey);
                    break;
                    /*
                    case StepNames.RegFinish:
                        setNextBtnTxt("Next");
                        setCurrentPage(StepNames.Confirm);
                    break;
                    */
                }
            break;
        }
        console.log("handlePrevious:",currentPage);
    }
    function handleNext(_text:string){

        
        switch(selectedRadio){
            case RadioNames.CreateAccount:
                switch(currentPage){
                    case StepNames.SelectMode:

                        setCurrentPage(StepNames.MakePhrase);
                        setResponseInfo([]);
                        makePhrase();
                        setPrivateKey("");
                        PreviousBtn.current?.setDisabled(false);
                        break;
                    case StepNames.MakePhrase:
                        setCurrentPage(StepNames.InputName);
                        setNextBtnTxt("Finish");
                    break;
                    case StepNames.InputName:
                        if(account_name==""){
                            showAlert("Please input name");
                            return;
                        }
                        setNextBtnTxt("Back");
                        PreviousBtn.current?.setDisabled(true);
                        setCurrentPage(StepNames.RegFinish);
                        (async ()  =>{
                            console.log("StepNames.InputName:",StepNames.InputName,selectedRadio,RadioNames.CreateAccount);
                            let server = await CallRustDelegate.GetServer();
                            console.log("server:",server);
                          
                            let privkey = await CryptoSupport.GenerateSolanaPrivateKey(mnemonic);
                            let respones_data = await CryptoSupport.RegisterAccount(server,{phrase:mnemonic,privatekey:privkey,username:account_name});
                            changeLoginStore(logout());
                            if(respones_data.status==HttpReqeust.STATUS_OK){
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);

                            }else if(respones_data.status==HttpReqeust.STATUS_ERROR){
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
                            }
                        })();

                    break;
                    case StepNames.RegFinish:

                        
                        setNextBtnTxt("Next");
                        setMnemonic("");
                        setCurrentPage(StepNames.SelectMode);
                    break;
                }
            break;
            case RadioNames.SecretPhrase:
                switch(currentPage){
                    case StepNames.SelectMode:
                        setResponseInfo([]);
                        setCurrentPage(StepNames.InputPhrase);
                        PreviousBtn.current?.setDisabled(false);
                        setNextBtnTxt("Login");
                        break;
                    case StepNames.InputPhrase:
                       
                        if(mnemonic==""){
                            showAlert("Please input 12 phrase");
                            return;
                        }
                        setCurrentPage(StepNames.LoginFinish);
                        setNextBtnTxt("Back");
                        PreviousBtn.current?.setDisabled(true);
                        (async ()  =>{
                            console.log("StepNames.InputName:",StepNames.InputName,selectedRadio,RadioNames.CreateAccount);
                            let server = await CallRustDelegate.GetServer();
                            console.log("server:",server);
                          
                            let privkey = "";//await CryptoSupport.GetSolanaPrivateKey(mnemonic);
                            let respones_data = await CryptoSupport.Login(server,{phrase:mnemonic,privatekey:privkey});
                            if(respones_data.status==HttpReqeust.STATUS_OK){
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
                                changeLoginStore(login({username:respones_data.data["username"],token:respones_data.data["token"],privatekey:await CryptoSupport.GenerateSolanaPrivateKey(mnemonic)}));
                                onLoggedin(respones_data.data["username"]);
                                console.log("token:",respones_data.data["token"]);
                                JWT.save_token(respones_data.data["token"]);
                            }else if(respones_data.status==HttpReqeust.STATUS_ERROR){
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
                            }
                        })();
                    break;
                    case StepNames.LoginFinish:
                        setNextBtnTxt("Next");
                        setMnemonic("");
                        setCurrentPage(StepNames.SelectMode);
                    break;

                }
            break;
            case RadioNames.PrivateKey:
                switch(currentPage){
                    case StepNames.SelectMode:
                        setResponseInfo([]);
                        setPrivateKey("");
                        setCurrentPage(StepNames.InputPrivkey);
                        
                        PreviousBtn.current?.setDisabled(false);
                        setNextBtnTxt("Login");
                        break;
                    case StepNames.InputPrivkey:
                       
                        if(privateKey==""){
                            showAlert("Please input privatekey!");
                            return;
                        }
                        setCurrentPage(StepNames.LoginFinish);
                        setNextBtnTxt("Back");
                        PreviousBtn.current?.setDisabled(true);
                        (async ()  =>{
                            console.log("StepNames.InputName:",StepNames.InputName,selectedRadio,RadioNames.CreateAccount);
                            let server = await CallRustDelegate.GetServer();
                            console.log("server:",server);
                          
                           
                            let respones_data = await CryptoSupport.Login(server,{phrase:mnemonic,privatekey:privateKey});//await CryptoSupport.balance(server,{phrase:mnemonic,token:JWT.read_token()});
                            console.log("balance:",respones_data);
                            if(respones_data.status==HttpReqeust.STATUS_OK){
                                onLoggedin(respones_data.data["username"]);
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
                                changeLoginStore(login({username:respones_data.data["username"],token:respones_data.data["token"],privatekey:privateKey}));
                                JWT.save_token(respones_data.data["token"]);
                            }else if(respones_data.status==HttpReqeust.STATUS_ERROR){
                                setResponseInfo([respones_data.data["username"],respones_data.data["info"]]);
                            }
                        })();
                    break;
                    case StepNames.LoginFinish:
                        
                        setNextBtnTxt("Next");
                        setMnemonic("");
                        setCurrentPage(StepNames.SelectMode);
                    break;

                }
            break;
        }
        console.log("handleNext:",currentPage);
        //setCurrentPage(oldvalue=>oldvalue<StepNames.MAX_STEP-1?oldvalue+1:oldvalue);

    }
    function handleChangePhrase(text:string){
        setMnemonic(text);
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
            
            
          <div className={`${currentPage==StepNames.SelectMode?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
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

        {/* make/input phrase */}
        <div className={`${currentPage==StepNames.MakePhrase || currentPage==StepNames.InputPhrase?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
  

          <Grid container spacing={0} sx={{ flexGrow: 1 }} >

            <Grid xs={12} className="flex justify-center">
            <div className={`${RadioNames.SecretPhrase==selectedRadio?"visible":"hidden"}`}>
                <PhraseList  className="" title="Input Secret Phrase" haspaste={false} editable={true} phrasecount={12} mnemonic={mnemonic} onChange={handleChangePhrase}/>            
            </div>

            <div className={`${RadioNames.CreateAccount==selectedRadio?"visible":"hidden"}`}>
                <PhraseList className="" title="Please keep your Phrase" haspaste={true} editable={false} phrasecount={12} mnemonic={mnemonic}/>
            </div>


            <div className={`${RadioNames.PrivateKey==selectedRadio?"visible":"hidden"} flex items-center h-[250px]`}>
                
                <Grid container spacing={0} sx={{ flexGrow: 1 }} className={``}>
                    <Grid xs={12} className="flex items-center justify-center">
                        <Typography level="h3" className="mb-4">PrivateKey:</Typography>
                    </Grid>
                    <Grid xs={12} className="">
                        <Textarea maxRows={4} minRows={4} value={privateKey} onChange={handleTextChange}/>

                    </Grid>
                </Grid>   
            </div>

            </Grid>
        </Grid>
        </div>


        {/* input private */}
        <div className={`${currentPage==StepNames.InputPrivkey?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
           <div className={`${RadioNames.PrivateKey==selectedRadio?"visible":"hidden"} flex items-center h-[250px]`}>
                
                <Grid container spacing={0} sx={{ flexGrow: 1 }} className={``}>
                    <Grid xs={12} className="flex items-center justify-center">
                        <Typography level="h3" className="mb-4">PrivateKey:</Typography>
                    </Grid>
                    <Grid xs={1} className=""></Grid>
                    <Grid xs={10} className="">
                        <Textarea maxRows={4} minRows={4} value={privateKey} onChange={handleTextChange}/>

                    </Grid>
                    <Grid xs={1} className=""></Grid>
                </Grid>   
            </div>
        </div>
         {/* input name */}
        <div className={`${currentPage==StepNames.InputName?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
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

        {/* regfinish/logined */}
        <div className={`${currentPage==StepNames.RegFinish || currentPage==StepNames.LoginFinish?"visible":"hidden"} BkgColor rounded-lg h-[320px]` }>
          <br/>
          <br/>
          <br/>
          <br/>

            <Grid container spacing={0} sx={{ flexGrow: 1 }} className="">
                    <Grid xs={12} className="flex justify-center">
                        <Typography level="h3" className="mb-4">{"[" + responseInfo[0] + "]"}</Typography>
                    </Grid>
                    
                    <Grid xs={12} className="flex justify-center">
                        <Typography level="h3" className="mb-4">{responseInfo[1]}</Typography>
                    </Grid>
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