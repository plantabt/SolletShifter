import { invoke } from '@tauri-apps/api/tauri';
export class CallRustDelegate{
    public static async  GetServer():Promise<string>{
        return await invoke("get_server");
    }
    public static async GetVersion():Promise<string>{
        return await invoke("get_version");
    }
}