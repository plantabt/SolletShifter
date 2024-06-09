import axios from "axios";
import { Buffer } from 'buffer';
window.Buffer = Buffer;
export class HttpReqeust {

  public static STATUS_OK = "OK";
  public static STATUS_FAILED = "FAILED";
  public static STATUS_TIMEOUT = "TIMEOUT";
  public static STATUS_ERROR = "ERROR";
  
  public static async PostData(url: any, data = {}) {

    try {
      //HttpReqeust.Init();
      let response = await axios.post(url, data);//,{withCredentials: true}
    
      return response.data;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  public static async GetData(url: any) {
    try {
      //HttpReqeust.Init();
      let response = await axios.get(url);//,{withCredentials: true}
    
      return response.data;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  public static async PutData(url: any) {
    try {
      //HttpReqeust.Init();
      let response = await axios.put(url);//,{withCredentials: true}
    
      return response.data;

    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  public static async DeleteData(url: any) {
    try {
      let response = await axios.delete(url);
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
