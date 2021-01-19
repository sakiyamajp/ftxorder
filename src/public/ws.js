class Ftxws{
  constructor() {
  }
	createEmit(){
		let ds = [
      // 'orderbook',
      'trades',
      'ticker'
    ].map(d => {
			return {
				op: "subscribe",
				channel : d,
				market : M.id
			}
		});
		let sub = $("#sub").val();
		let now = +new Date();
		let sign = CryptoJS.HmacSHA256(
			now+"websocket_login",
			CONFIG.secret
		);
		sign = sign.toString(CryptoJS.enc.Hex);
		let d = {
      args: {
        key: CONFIG.key,
        sign: sign,
        time: now,
      },
      op: "login"
    };
		if(CONFIG.subaccount){
			d.args.subaccount = CONFIG.subaccount;
		}
		ds.push(d);
		ds.push({
			op : 'subscribe',
			channel : 'fills'
		});
		ds.push({
			op : 'subscribe',
			channel : 'orders'
		});
		return ds;
	}
  connect(){
		if(this.socket){
      this.socket.onclose = () => {};
			this.socket.close();
		}
		this.socket = new WebSocket('wss://ftx.com/ws/');
    let socket = this.socket;
    socket.onopen = async () => {
			let ds = this.createEmit();
			for(let d of ds){
				socket.send(JSON.stringify(d));
				if(d.op == "login"){
					await sleep(300);
				}
			}
    }
    socket.onclose = async d => {
      await sleep(1000);
      this.connect();
    }
    socket.onerror = async e => {
      L("ftx ws",e);
      socket.close();
    }
    socket.onmessage = d => {
			this.ondata(d);
    }
  }
	ondata(row){
		let ds = JSON.parse(row.data);
		if(ds.type == "subscribed"){
			return;
		}
		let channel = ds.channel;
		ds = ds.data;
		switch(channel){
      case "orders" :
        this.onorders(ds);
				return;
      case "fills" :
        this.onfills(ds);
        return;
			case "ticker" :
        /*
        ask: 1155.8
        askSize: 5.055
        bid: 1155.6
        bidSize: 2
        last: 1155.6
        time: 1610728848.913628
        */
        this.ontick(ds);
				return;
			case "orderbook" :
				return;
			case "trades" :
        ds = ds.map(d => {
        	let size = (d.side == "buy") ? d.size : -d.size;
        	return {
        		liquidation: d.liquidation,
        		price: d.price,
        		size,
            time : +new Date(d.time)
        	}
        });
        this.ontrades(ds);
				return;
		}
L(channel,ds,row)
	}
}
