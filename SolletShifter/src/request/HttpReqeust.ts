import axios from "axios";
import { Buffer } from 'buffer';
window.Buffer = Buffer;
export class HttpReqeust {

  public static STATUS_OK = "OK";
  public static STATUS_FAILED = "FAILED";
  public static STATUS_TIMEOUT = "TIMEOUT";
  public static STATUS_ERROR = "ERROR";
  public static Init() {
    /*
    const Server = axios.create({
      baseURL: "", //后端接口地址
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    Server.interceptors.request.use(
      (config) => {
        if (localStorage.Authorization) {
          config.headers.Authorization = document.getLocalStorage("Authorization");
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // 后置拦截器
    Server.interceptors.request.use(
      (response) => {
        return response.data;
      },
      (error) => {
        if (error.response.data.code == 401) {
          //token过期或没传token 需要重新登陆获取token
          window.location.href = url;
        }
        return Promise.reject(error);
      }
    );
    */
   // 响应拦截器
    axios.interceptors.request.use(function (config) {
      console.warn("request config:", config);
      config.headers.Cookie = axios.defaults.withCredentials ? document.cookie : '';
      return config;
    }, function (error) {
      return Promise.reject(error);
    });

  }
  public static async PostData(url: any, data = {}) {

    try {
      //HttpReqeust.Init();
      let response = await axios.post(url, data,{withCredentials: true});
    
      return response.data;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }

  }
  public static async post(url: string, postdata: any) {
    let respons_data = await HttpReqeust.PostData(url, postdata)
      .then(data => {
        console.log('Success:', data);
        return data;
      })
      .catch((error) => {
        console.error('Error:', error);
        return null;
      });
    return respons_data;
  }
}
