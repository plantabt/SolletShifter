

export interface RegisterRequest{
    phrase:String,
    privatekey:String,
    username:String,

}

export interface LoginRequest{
    phrase:String,
    privatekey:String,
}
export interface QueryBalance{
    phrase:String,
    token:String
}
export interface CreateSubAccountPayload{
    phrase:String,
    privatekey:String,
    name:String,
    token:String
}
/*
export enum ResponseStatus{
    STATUS_OK= "OK",
    STATUS_FAILED = "FAILED",
    STATUS_TIMEOUT = "TIMEOUT",
    STATUS_ERROR = "ERROR"
}*/
export interface SubAccount{
    name:string,
    privkey:string,
    phrase:string,
}