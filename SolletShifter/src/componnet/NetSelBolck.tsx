import "./NetSelBlock.css";

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';

import {  Dropdown, Grid, Menu, MenuButton, MenuItem, SvgIconProps } from "@mui/joy";

import SolanaIcon  from 'cryptocurrency-icons/32/color/sol.png';
import EthIcon  from 'cryptocurrency-icons/32/color/eth.png';
import PolyIcon  from 'cryptocurrency-icons/32/color/poly.png';
import { MoreVert } from "@mui/icons-material";
import IconButton from '@mui/joy/IconButton';
import { useEffect, useState } from "react";
interface NetSelBlockProps {
    netname: string;      // 按钮显示的文字
    onClick?: () => void; // 点击事件处理器，可选属性
    className?:string;
    icon:React.ReactElement<SvgIconProps>;
    onNetChange:(selnet:string)=>void;
  }
const NetSelBlock: React.FC<NetSelBlockProps> = ({ netname, onClick,className ,icon,onNetChange=null}) => {  

    const combinedClassName = `NetSelBlock ${className}`;
    const [netName,setNetName] = useState(netname);
    const [iconState,setIconState] = useState(icon);
    useEffect(()=>{
        setIconState(icon);
        setNetName(netname);
    },[icon,netname]);

    function ItemOnClick(item: any):void{
        let id = item.target.id;
        setNetName(id);
        if(id=="SOLANA"){
            setIconState(<img src={SolanaIcon} className=" w-8 h-8 brightness-80" />);
        }else if(id=="ETH"){
            setIconState(<img src={EthIcon} className=" w-8 h-8 brightness-80" />);
           
        }else if(id=="POLY"){
            setIconState(<img src={PolyIcon} className=" w-8 h-8 brightness-80" />);
        }
        if(onNetChange!=null){
            onNetChange(id);
        }
    }
  return (
    <div className={combinedClassName} onClick={onClick}>
        <Grid container spacing={0} sx={{ flexGrow: 1}}>
            <Grid xs={7} className=" -mt-5 mb-3 ">
                <span className="NetSelBlockTitle">
                CURRENT NET:
                </span>
            </Grid>
            
            <Grid xs={5}>

            </Grid>
             
            <Grid xs={2} >
                <div className="NetSelBlockIcon">{iconState}</div>
            </Grid>
            <Grid xs={7} className="NetSelBlockNetTitle">
                <span >
                {netName}
                </span>
            </Grid>
            <Grid xs={3} >
             
                <Dropdown >
                    <MenuButton className="origin-center rotate-90 shadow-none MenuButton"
                        slots={{ root: IconButton }}
                        slotProps={{ root: { variant: 'plain', color: 'neutral' } }}
                    >
                        <MoreVert />
                    </MenuButton>
                    <Menu className="Menu">
                        <MenuItem className="MenuItem" id="SOLANA" onClick={ItemOnClick}><img src={SolanaIcon} />SOLANA-MAIN</MenuItem>
                        <MenuItem className="MenuItem" id="ETH" onClick={ItemOnClick}><img src={EthIcon}/> ETH</MenuItem>
                        <MenuItem className="MenuItem" id="POLY" onClick={ItemOnClick}><img src={PolyIcon}/>POLY</MenuItem>
                    </Menu>
                </Dropdown>
            </Grid>
        </Grid>


    </div>
  );
}

export default NetSelBlock;
