
import { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import "./PhraseList.css"

import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded'
import Grid from "@mui/joy/Grid";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input/Input";
interface ComponnetProps{
    phrasecount:number;
    editable:boolean;
    haspaste:boolean;
    title?:string;
    className?:string;
    mnemonic:string;
    onChange?:(phrase:string)=>void;
}
export interface PhraseListExport{
    //setPhrase:(phrase:string)=>void;
}

const BackButton = forwardRef<PhraseListExport,ComponnetProps> ((props,ref)=>{
    const {mnemonic,onChange,className="",title="",haspaste,editable,phrasecount}=props;
    //const [_mnemonic,setMnemonic] = useState<string>("");
    const [_phrases,_setPhrases] = useState<string[]>([]);
    const [phraseElement,setPhraseElement] = useState<Array<JSX.Element>>([]);
    function handlePaste(event:React.ClipboardEvent<HTMLInputElement>)  {
        event.preventDefault();
        let pasteData = event.clipboardData.getData('text');
       // pasteData = pasteData.slice(0, 10); // slice the string as needed
        //setMnemonic(pasteData);
        _setPhrases(pasteData.split(" "));
        onChange?.(pasteData);
        console.log(pasteData); // do something with the sliced string
        
      }
    
      
    useImperativeHandle(ref,()=>({  
        /*
        setPhrase:(phrase:string)=>{
            if(phrase=="")return;
            console.log("phrase:",phrase.split(" "));
            _setPhrases(phrase.split(" "));
            //insertPhraseElement();
        }*/
    }));


    useEffect(()=>{
        if(mnemonic!=""){
            _setPhrases(mnemonic.split(" "));
        }else{
            _setPhrases([]);
        }
    },[mnemonic]);

    useEffect(()=>{
        insertPhraseElement();
    },[_phrases]);
    
    function insertPhraseElement(){
        try{
            let _phraseElement:Array<JSX.Element> = [];
            setPhraseElement([]);
            for(let i=0;i<phrasecount;i++){
               
                _phraseElement.push(
                    <Grid xs={4} key={i} className="h-14 flex justify-center items-center mt">
                        <span className={(i>8?"-ml-5 px-[15px] ":"mr-4 ") + " mt-1"} >{i+1}.</span>
                        <Input size="sm"   value={_phrases[i] || ''} className="w-24 h-4" onPaste={handlePaste} onChange={(event)=>handlePhraseChange(event,i)} disabled={!editable}/>
                    </Grid>
                );
                
            }
            
            setPhraseElement(_phraseElement); 
            
        }catch(e){
            
        }
    }
    function phrasesToMnemonic():string{
        let phrase:string = "";
        for(let i=0;i<_phrases.length;i++){
            phrase==""?phrase=_phrases[i]:phrase+=" "+_phrases[i];
        }
        return phrase;
    }
    async function handleCopyScKey(){
        await navigator.clipboard.writeText(phrasesToMnemonic());
        //SnackPopbarRef.current?.setTitle("Copy Secret Phrase success!!")
        //SnackPopbarRef.current?.Open(true);
    }
    function handlePhraseChange(event:ChangeEvent<HTMLInputElement>,index:number){
        if(editable){
            let newPhrase = [..._phrases];
            newPhrase[index] = event.target.value;
            _setPhrases(newPhrase);
        }
    }

return(
    <Grid container spacing={0} sx={{ flexGrow: 1 }} className={className}>
    <Grid xs={12} className="mb-3 flex justify-center items-center">
        <Typography level="h3" > {title}</Typography>
        <ContentCopyIcon className={`${haspaste?"visible":"hidden"} ml-2 hover:scale-105 active:scale-110 fill-current text-green-500 `} onClick={handleCopyScKey}/>
    </Grid>
    {phraseElement}
    <Grid xs={12} className="">
    
        
    </Grid>
    </Grid>
);
});


export default BackButton;