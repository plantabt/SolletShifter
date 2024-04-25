import axios from "axios";
import { Buffer } from 'buffer';
window.Buffer = Buffer;
export class HttpReqeust{
    public static async PostData (url:any, data = {}) {
        try {
          const response = await axios.post(url, data, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          return response.data; 
        } catch (error) {
          console.error('Error:', error);
          throw error; 
        }
      }
      
}
