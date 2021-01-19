'use strict'
export default class socket{
	constructor(config){
		this.io = config.io;
		this.api = config.api;
		this.io.on('connection', socket => {
			socket.on('ohlcs',async symbol => {
				this.ohlcs(socket,symbol);
			});
			socket.on('account',async ds => {
				this.account(socket);
			});
			socket.on('order',async ds => {
				ds.side = ds.buy ? "buy" : "sell";
				delete ds.buy;
				try{
					let d = await this.api._orderOneOptions(ds);
					// socket.emit('orders',[d]);
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
	async account(socket){
		try{
			let account = await this.api.account();
			this.io.local.emit("account",account.result);
		}catch(e){
		}
	}
	async ohlcs(socket,symbol){
		let ohlcs = await this.api.ohlc(symbol,{
			resolution : 60,
			limit : 700,
		});
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
