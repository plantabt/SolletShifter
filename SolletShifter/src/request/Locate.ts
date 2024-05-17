export class CLocate{
    public static createCryptoImageUrl(name:string){
        return new URL(`../assets/cryptocurrency-icons/32@2x/color/${name.toLowerCase()}@2x.png`, import.meta.url).href;
      }
}