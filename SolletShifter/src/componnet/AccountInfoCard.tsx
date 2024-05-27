

import '@fontsource/inter';
import 'tailwindcss/tailwind.css';
import "./AccountInfoCard.css";
import AccountCard from '../assets/imgs/account_card_bg.png'
import AccountCardInfo from '../assets/imgs/account_card_info.png'
import AccountCardMoreBtn from '../assets/imgs/account_card_more_btn.png'
import DeleteBtn from '@mui/icons-material/DeleteForeverRounded'
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded'
import PubKeyCpy from "../assets/imgs/pubkey_cpy.png"
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';


import { Dropdown, Menu, MenuButton, MenuItem, Table } from "@mui/joy";
import { Box, Grid, List, ListItem, ListItemButton, listItemButtonClasses, Sheet, SvgIconProps } from "@mui/joy";
import { forwardRef,  ReactElement, useEffect, useImperativeHandle, useRef, useState } from "react";
import TitleIcon from '@mui/icons-material/AccountBalanceRounded'
import { ArrowDropDown} from "@mui/icons-material";
import SlanaIcon from 'cryptocurrency-icons/32@2x/color/sol@2x.png'
import EthIcon from 'cryptocurrency-icons/32@2x/color/eth@2x.png'
import PolyIcon from 'cryptocurrency-icons/32@2x/color/poly@2x.png'
import { CryptoSupport } from '../request/CryptoSupport';
import SnackPopbar, { SnackPopbarExportRef } from './SnackPopbar';

interface ComponnetProps {

  onClick?: (e: any) => void;
  onClickRemove?: (e: any) => void;
  AccountName: string;
  Mnemonic: string;
}
export interface AccountInfoCardExport {
  updateTransfer:()=>void;
  updateMints:()=>void;
  getTitle: () => string;
}


interface SelectedPubkeyCopy {
  name?: string;
  icon?: ReactElement<SvgIconProps>,
  addr?: string;

}

interface MintItem{
  name?: string,
  icon?: ReactElement<SvgIconProps>,
  balance?: number,
  token?: string,
}

interface TransactionRecord{
  icon?: ReactElement<SvgIconProps>,
  ispayout?:boolean,
  datetime?:string,
  sender?:string,
  authority?:string,
  recipient?:string,
  amount?:number,
  minttoken?:string,
  mintname?:string
}
/*
function createData(mint:MintItem) {
  return { date, cost, fat, carbs, protein };
}
*/


const AccountInfoCard = forwardRef<AccountInfoCardExport, ComponnetProps>((props, ref) => {
  //createData('04/12/24', <span className="flex justify-start"><img src={SlanaIcon} className="w-4 h-4 -mt-[1px]" />123.00</span>, 6.0, 24, 4.0)
  const [transactionRecords,setTransactionRecords]=useState<TransactionRecord[]>([]);
  const [rows,_setRows] = useState<MintItem[]>([]);
  const { onClick, onClickRemove, AccountName, Mnemonic } = props;
  const [PubkeyList,setPubkeyList]=useState<SelectedPubkeyCopy[]>([]);
  const [_AccountName, _setAccountName] = useState<string>(AccountName);
  const [_Mnemonic, _setMnemonic] = useState<string>(Mnemonic);
  const SnackPopbarRef = useRef<SnackPopbarExportRef>(null);

  const [seledPubkey, setSeledPubkey] = useState<SelectedPubkeyCopy | null>(null);
  //const [_combinedClassName,setCombinedClassName] = useState(`AccountInfoCard ${className}`);
  //const refCheckState = useRef(checked);
 
  //implement export functions
  useImperativeHandle(ref, () => ({
    updateMints:()=>{
    },
    updateTransfer:()=>{
    },
    getTitle: () => {
      return "";
    }
  }));
  function handleOnClick(e: any) {
    onClick?.(e);
  }
  function handleDelBtn(e: any) {
    onClickRemove?.(e);
  }
  function formatText(text: string) {
    if (text == undefined) {
      return "";
    }
    if (text.length <= 0) {
      return text;
    }

    const startChars = 16; // 显示前10个字符
    const endChars = 16; // 显示后10个字符
    const dots = "...";

    const start = text.slice(0, startChars);
    const end = text.slice(-endChars);

    return `${start}${dots}${end}`;
  }
  async function handleCopyContent(){
    await navigator.clipboard.writeText(seledPubkey?.addr?seledPubkey?.addr:"");
    SnackPopbarRef.current?.setTitle(`Copy ${seledPubkey?.addr} success!!`);
    SnackPopbarRef.current?.Open(true);
  }

  useEffect(() => {
      
      if(PubkeyList.length==1){
        setSeledPubkey(PubkeyList[0]);
        //GetMints();
        GetTransactions();
        /*
        for(let i in trans){
          console.log(mints[i].name,mints[i].balance,mints[i].token,CLocate.createCryptoImageUrl(mints[i].name.toLowerCase()));
          setRows(oldparams=>[...oldparams,{name:mints[i].name,balance:mints[i].balance,token:mints[i].token,icon:<img src={CLocate.createCryptoImageUrl(mints[i].name.toLowerCase())} width={20} height={20} className={'mr-1'}/>}]);
        }
        setRows(oldparams=>[...oldparams,{name:mints[i].name,balance:mints[i].balance,token:mints[i].token,icon:<img src={CLocate.createCryptoImageUrl(mints[i].name.toLowerCase())} width={20} height={20} className={'mr-1'}/>}]);
        */
    }

    //let formattedText = formatText(seledPubkey.addr);
  }, [PubkeyList]);

  async function GetTransactions(){
    let trans = await CryptoSupport.requestRecentTransfer("http://127.0.0.1:9191","slight convince worth multiply evil ecology harbor fly casino supply minimum arm");
    for(let i in trans){
      console.log("trans[i].authority==seledPubkey",trans[i].authority,PubkeyList[0]?.addr);
      setTransactionRecords(oldparams=>[...oldparams,{ispayout:trans[i].authority==PubkeyList[0]?.addr?true:false, datetime:trans[i].datetime,sender:trans[i].sender,authority:trans[i].authority,recipient:trans[i].recipient,amount:trans[i].amount,minttoken:trans[i].minttoken,mintname:trans[i].mintname}]);
    }
  }

/*
  async function GetMints(){
    let mints = await CryptoSupport.GetSolanaMints(_Mnemonic);
    for(let i in mints){
      console.log(mints[i].name,mints[i].balance,mints[i].token,CLocate.createCryptoImageUrl(mints[i].name.toLowerCase()));
      setRows(oldparams=>[...oldparams,{name:mints[i].name,balance:mints[i].balance,token:mints[i].token,icon:<img src={CLocate.createCryptoImageUrl(mints[i].name.toLowerCase())} width={20} height={20} className={'mr-1'}/>}]);
    }
    console.log(mints);
  }*/
  async function init() {
  
    if(PubkeyList.length>0){

      return;
    }
    
    let pubkey = (await CryptoSupport.GetSolanaPubKey(_Mnemonic)).toString();
    setPubkeyList(oldparams=>[...oldparams,{ name: 'SOLANA', icon: <img src={SlanaIcon} className="w-4 h-4" />, addr: pubkey }]);

    pubkey = await CryptoSupport.generateEthereumPublicKey(_Mnemonic);
    setPubkeyList(oldparams=>[...oldparams,{ name: 'ETH', icon: <img src={EthIcon} className="w-4 h-4" />, addr: pubkey }]);

    pubkey = await CryptoSupport.generatePolygonPublicKey(_Mnemonic);
    setPubkeyList(oldparams=>[...oldparams,{ name: 'POLY', icon: <img src={PolyIcon} className="w-4 h-4" />, addr: pubkey }]);
    
    
    //setSelectedItem({seledPubkey?.icon}<span> {": "+formatText(seledPubkey?.addr)}</span>);
  }
  
  init();

  const tableTheme = extendTheme({
    components: {
      JoyTable: {
        styleOverrides: {
          root: ({ }) => ({
            ...({
              // this example applies borders between <thead> and <tbody>
              'thead th:not([colspan])': {
                borderBottom: '0px solid',
                fontSize: '12px',
                borderColor: '#727272',
                backgroundColor: "rgb(55 65 81 / var(--tw-bg-opacity))",
                padding: '0 10 0 0',
                height: '20px',
                lineHeight: '12px',

              },

              'tr:not(:last-of-type)>td': {
                borderBottom: '2px solid',
                fontSize: '12px',
                borderColor: 'rgb(55 65 81 / var(--tw-bg-opacity))',
                backgroundColor: 'rgb(75 85 99 / var(--tw-bg-opacity))',
                lineHeight: '14px',
                height: '20px',
                padding: '0 0 0 0',
              },
              'td': {
                borderBottom: '2px solid',
                fontSize: '12px',
                borderColor: 'rgb(55 65 81 / var(--tw-bg-opacity))',
                backgroundColor: 'rgb(75 85 99 / var(--tw-bg-opacity))',
                lineHeight: '14px',
                height: '20px',
                padding: '0 0 0 0',
              },
            }),
          })
        }
      }
    }
  })
  return (
    <CssVarsProvider theme={tableTheme}>

      <Grid container spacing={0} sx={{
        flexGrow: 1,
        width: 622, // 使用数值直接指定宽度，单位是px
        height: 240, // 使用数值直接指定高度，单位是px
        backgroundImage: `url(${AccountCard}), url(${AccountCardInfo})`, // 设置多个背景图片
        backgroundSize: 'cover, 150px 238px',
        backgroundPosition: 'center center, 2px top', // 每个背景的位置
        backgroundRepeat: 'no-repeat, no-repeat' // 每个背景的重复方式
      }} className="w-[622px] h-[240px]">
        <Grid xs={3} >
          <Grid spacing={0} sx={{ flexGrow: 1 }} className="h-48 min-h-48">
            <Grid xs={12} className="mt-3 flex items-start">
              <TitleIcon className=" w-5 h-5 text-left mx-4" />
              <span className="-mx-3 text-sm">{AccountName}</span>
            </Grid>
            <Grid xs={12} className="flex items-start mt-[3px]">
              <span className="text-[12px] text-left mx-4">BaseInfo:</span>
            </Grid>
            <Grid xs={12} className="flex items-start mt-[2px]">
              <span className="text-xs text-left mx-4">Currency: 12</span>
            </Grid>
            <Grid xs={12} className="flex items-start mt-[8px]">
              <span className="text-xs text-left mx-4">Monthly Report:</span>
            </Grid>
            <Grid xs={12} className="pt-2 cursor-default">

              <Box sx={{ width: "95%", pl: '24px', }} className="overflow-y-auto overflow-x-hidden max-h-24 cursor-default" >
                <List
                  size="sm"
                  className=" cursor-default -ml-2"
                  sx={() => ({

                    // Gatsby colors
                    '--joy-palette-primary-plainColor': '#8a4baf',
                    '--joy-palette-neutral-plainHoverBg': 'transparent',
                    '--joy-palette-neutral-plainActiveBg': 'transparent',
                    '--joy-palette-primary-plainHoverBg': 'transparent',
                    '--joy-palette-primary-plainActiveBg': 'transparent',


                    '--List-insetStart': '32px',
                    '--ListItem-paddingY': '0px',
                    '--ListItem-paddingRight': '16px',
                    '--ListItem-paddingLeft': '21px',
                    '--ListItem-startActionWidth': '0px',
                    '--ListItem-startActionTranslateX': '-50%',

                    [`& .${listItemButtonClasses.root}`]: {
                      borderLeftColor: 'divider',
                    },
                    [`& .${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]: {
                      borderLeftColor: 'currentColor',
                    },
                    '& [class*="startAction"]': {
                      color: 'var(--joy-palette-text-tertiary)',
                    },
                  })}
                >
                  <ListItem nested >
                   
                    {transactionRecords.map((item,index)=>(
                      <ListItemButton tabIndex={-1} selected key={index}>
                        <span className="text-xs">{item.datetime}
                          <div className="flex items-center justify-start ">
                            <div className={`text-[8px]  mr-4 ${item.ispayout?'text-red-400':'text-green-400'}`}>{item.mintname}{item.ispayout?'-':'+'}</div>
                            <div className={`text-xs ${item.ispayout?'text-red-400':'text-green-400'}`} text-green-400 >{item.amount}</div>
                          </div>
                        </span>
                      </ListItemButton>
                    ))
                    }

                  </ListItem>

                </List>
              </Box>
            </Grid>
          </Grid>
          <Grid xs={12} className="flex items-start mt-[10px] w-[90%]">
            <span className="text-xs text-left mx-4">Total:</span>
            <span className="text-xs text-left -mx-2 text-green-400 block overflow-hidden overflow-ellipsis whitespace-nowrap">0.00</span>
          </Grid>
        </Grid>
        <Grid xs={9} >
          <Grid spacing={0} sx={{ flexGrow: 1 }}>

            <Grid xs={8} className="flex justify-start items-center" >
              <div style={{ backgroundImage: `url(${PubKeyCpy})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center' }} className='w-[400px] mx-4 mt-2 h-8 flex justify-start items-center'>
                <span className="text-xs text-left mx-3">Pubkey:</span>
                <Dropdown >
                  <MenuButton endDecorator={<ArrowDropDown />} className="text-xs min-h-5 max-h-5  w-[300px] max-w-[300px] min-w-[300px] shadow-none border-none rounded-none MenuDropDown">{seledPubkey?.icon}<span> {": "+formatText(seledPubkey?.addr?seledPubkey?.addr:"")}</span></MenuButton>
                  <Menu className="min-w-[380px] max-w-[380px] w-[380px]">

                    <ListItem nested className="text-xs ">
                      <List className="text-xs">
                        {PubkeyList.map((item,index) => (
                          <MenuItem
                            className='min-h-5 max-h-5'
                            key={index}
                            onClick={() => {
                              setSeledPubkey(item);
                            }}
                          >
                            {item.icon}{item.addr}
                          </MenuItem>
                        ))}
                      </List>
                    </ListItem>
                  </Menu>
                </Dropdown>
              </div>

            </Grid>
            <Grid xs={2} className="flex justify-end items-center">
              <ContentCopyIcon className='ContentCopyBtn' onClick={handleCopyContent}/>
            </Grid>
            <Grid xs={2} className="flex justify-end items-center">
              <DeleteBtn className='DeleteBtn' onClick={handleDelBtn} />
            </Grid>
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

            <Grid xs={12} className="flex justify-end">
              <div onClick={handleOnClick} style={{ backgroundImage: `url(${AccountCardMoreBtn})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center center', }} className='MoreDetailsBtn'><span className='mt-2 text-sm'>More Detials</span></div>
            </Grid>
          </Grid>


        </Grid>
      </Grid>
      <SnackPopbar ref={SnackPopbarRef} />
    </CssVarsProvider>
  );
});

export default AccountInfoCard;
