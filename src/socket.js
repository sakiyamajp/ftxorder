'use strict'
export default class socket{
	constructor(config){
		this.io = config.io;
		this.api = config.api;
		this.io.on('connection', socket => {
			socket.on('ohlcs',async (symbol,options) => {
				this.ohlcs(socket,symbol,options);
			});
			socket.on('account',async ds => {
				this.account(socket);
			});
			socket.on('order',async ds => {
				ds.side = ds.buy ? "buy" : "sell";
				delete ds.buy;
				try{
					let d = await this.api._orderOneOptions(ds);
				}catch(e){
					socket.emit('message',e.error,"error");
				}
			});
			socket.on('cancel',async ids => {
				for(let id of ids){
					this.cancel(socket,id);
				}
			});
			socket.on('orders',async symbol => {
				try{
					let ds = await this.api.orders(symbol);
					socket.emit('orders',ds);
				}catch(e){
					socket.emit('message',e.error,"error");
				}
			});
		});
		this.polling();
	}
	async polling(){
		while(true){
			this.account();
			this.position();
			this.balance();
			await sleep(1000);
		}
	}
	async cancel(socket,id){
		try{
			await this.api.cancel(id);
		}catch(e){
			socket.emit('message',e.error,"error");
		}
	}
	async balance(){
		try{
			let ds = await this.api.ccxt.fetchBalance();
			this.io.local.emit("balance",ds.info.result);
		}catch(e){
		}
	}
	async position(){
		try{
			let ds = await this.api.position();
			this.io.local.emit("position",ds);
		}catch(e){
		}
	}
	async account(){
		try{
			let account = await this.api.account();
			this.io.local.emit("account",account.result);
		}catch(e){
		}
	}
	async ohlcs(socket,symbol,options){
		let ohlcs = await this.api.ohlc(symbol,options);
		ohlcs = ohlcs.map(d => {
			return {
				t : d.time,
				o : d.open,
				h : d.high,
				l : d.low,
				c : d.close,
			}
		});
		socket.emit("ohlcs",ohlcs);
	}
}
