import https from "https";
import fetch from 'node-fetch'
import querystring from 'querystring'
import crypto from 'crypto';
export default class Api{
  constructor(config = {}){
    this.config = config;
    this.httpsAgent = new https.Agent({
      keepAlive: true,
      keepAliveMsecs : 999999999
    });
  }
  crypto(query){
    return crypto.createHmac('sha256', this.config.secret)
      .update(query)
      .digest('hex');
  }
  async account(){
    return this.execute("GET",`/account`);
  }
  async cancel(id){
    if(id){
      return this.execute("DELETE",`/orders/${id}`);
    }else{
      return this.execute("DELETE",`/orders`);
    }
  }
  async ohlc(market,options){
    let ds = await this.execute("GET",`/markets/${market}/candles`,options);
    return ds.result;
  }
  async orders(market){
    let orders = await this.execute("GET",`/orders`,{
      market : market
    });
    return orders.result;
  }
  async _orderOneOptions(options){
    let order = await this.execute("POST","/orders",options);
    return order.result;
  }
  async execute(method,path,body){
    let now = +new Date;
    let payload = "";
    path = "/api" + path;
    switch(method){
      case "GET" :
        if(body) {
          path += '?' + querystring.stringify(body);
        }
        break;
      case "POST" :
        body = JSON.stringify(body);
        payload = body;
        break
    }
    let headers = {
      'content-type' : 'application/json',
      "FTX-TS" : now,
    }
    if(this.config.key && this.config.secret){
      let sign = this.crypto(now + method + path + payload);
      headers["FTX-KEY"] = this.config.key;
      headers["FTX-SIGN"] = this.crypto(now + method + path + payload);
    }
    if(this.config.subaccount){
      // sub account keyにつけるとへんぽい
      // L("encodeURI(this.config.subaccount)",encodeURI(this.config.subaccount))
      headers["FTX-SUBACCOUNT"] = encodeURI(this.config.subaccount);
    }
    let options = {
      agent : this.httpsAgent,
      method,
      headers,
    };
    if(method == "POST"){
      options.body = body;
    }
    let order = await fetch(`https://ftx.com` + path, options)
      .then(res => res.json());
    if(!order.success){
      L(order,method,path,body);
      throw order;
    }
    return order;
  }
}
