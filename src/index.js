'use strict'
const g = await import('./global.js');
import Express from "./express.js";
import Socket from "./socket.js";
import Ccxt from 'ccxt';
import Api from './api.js';

let ccxt = new Ccxt.ftx();
let ms = await ccxt.fetchMarkets();

// PERPのみにしとく。
ms = ms.filter(m => m.id.indexOf("PERP") != -1);

let api = new Api({
  key : user_config.key,
  secret : user_config.secret,
  subaccount : user_config.subaccount,
});

user_config.ms = ms;
let express = new Express(user_config);
let socket = new Socket({
  api,
  io : express.io
});
