export class JWT{
    public static save_token(token: string){
        localStorage.setItem("Authorization", token);
    }
    public static read_token():string{
        let token = localStorage.getItem("Authorization");
        if(null==token){
            return "";
        }
        return token;
    }
}