export class JWT{
    public static save_token(token: string){
        localStorage.setItem("Authorization", token);
    }
    public static read_token():string | null{
        return localStorage.getItem("Authorization");
    }
}