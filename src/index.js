'use strict'
const g = await import('./global.js');
import Express from "./express.js";
import Socket from "./socket.js";
import Ccxt from 'ccxt';
import Api from './api.js';

let api = new Api({
  key : user_config.key,
  secret : user_config.secret,
  subaccount : user_config.subaccount,
});
let ms = await api.ccxt.fetchMarkets();
// PERPのみにしとく。
ms = ms.filter(m => {
  // if(m.type == "spot"){
  //   return true;
  // }
 if(m.id.indexOf("MOVE") != -1){
   return false;
 }
  let perp = m.id.indexOf("PERP") != -1;
  let future = m.id.match(/\w+\-\d{4}/);
  return perp || future
});

user_config.ms = ms;
let express = new Express(user_config);
let socket = new Socket({
  api,
  io : express.io
});
