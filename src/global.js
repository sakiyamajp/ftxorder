"use strict";
import moment from "moment-timezone";
import user_config from "../config.js";
import fs from "fs";
import util from "util";
import d3 from "d3";
process.env.TZ = 'Asia/Tokyo';
global.user_config = user_config;

global.fs = fs;
global.util = util;
global.moment = moment;
global.d3 = d3;
let timeFormat = d3.timeFormat("%m/%d %H:%M:%S");
global.L = function(){
	let params = timeFormat(new Date().getTime());
	params = [ params ];
	for(let d of arguments){
		params.push(d);
	}
	console.log.apply(null,params);
};
global.sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}
