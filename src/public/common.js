let L = console.log;
let sleep = (ms) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}
let M;
let A;
/*
backstopProvider: false
chargeInterestOnNegativeUsd: false
collateral: 1271.7509106777131
freeCollateral: 1270.4092662060018
initialMarginRequirement: 0.05
leverage: 20
liquidating: false
maintenanceMarginRequirement: 0.03
makerFee: 0.0002
marginFraction: null
openMarginFraction: null
positionLimit: null
positionLimitUsed: null
positions: (3) [{…}, {…}, {…}]
spotLendingEnabled: false
spotMarginEnabled: false
takerFee: 0.000665
totalAccountValue: 1271.7509106777131
totalPositionSize: 0
useFttCollateral: true
username: "example@example.net/develop"
*/
const socket = io('ws://localhost:'+CONFIG.port);
// log front
let LF = (ds,type) => {
	let p = $(`<p>${ds}</p>`);
	if(type){
		p.addClass(type);
	}
	p.css("opacity",0);
	p.css("margin-left",10);
	$(".log").append(p);
	p.animate({
		"margin-left" : 0,
		"opacity" : 1
	},200)
	setTimeout(() => {
		p.animate({
			"margin-left" : -10,
			"opacity" : 0
		},200,()=>{
			p.animate({
				"height" : 0
			},200,()=>{
				p.remove();
			})
		})
	},8000);
};
$(async () => {
	let inputs = new Inputs();
	let ws = new Ftxws();
	let chart = new Chart();
	ws.ontrades = ds => {
		chart.bar.update(ds)
	}
	ws.onorders = d => {
		chart.order.update(d);
		if(d.status != "closed" ||
			d.type != "limit"){
			return;
		}
		let size = d.side == "buy" ? d.size : -d.size;
		LF(`${size}@${d.price} closed`);
	}
	ws.onfills = d => {
		if(M.id != d.market){
			return;
		}
		/*
		baseCurrency: null
		fee: 0.0008319815
		feeCurrency: "USD"
		feeRate: 0.000665
		future: "ETH-PERP"
		id: 675268971
		liquidity: "taker"
		market: "ETH-PERP"
		orderId: 22884065020
		price: 1251.1
		quoteCurrency: null
		side: "buy"
		size: 0.001
		time: "2021-01-17T02:01:36.940913+00:00"
		tradeId: 336264034
		type: "order"
		*/
		let size = d.side == "buy" ? d.size : -d.size;
		LF(`fill ${size}`);
		let element = $("span.lot");
		let now = +element.text();
		now += size;
		now = +now.toPrecision(10);
		element.text(now);
	}
	ws.ontick = ds => {
		chart.tick(ds);
		// let marketPrice = (ds.bid + ds.ask + ds.last) / 3;
		M.tick = ds;
	}
	let range = new Range();
	function updateM(){
		let symbol = $('#symbol').val();
		M = CONFIG.ms.filter(m => m.id == symbol)[0];
		// L(M)
		$('.base_currency').text(M.base);
		new TradingView.widget({
			"width": $("#tradingview").width(),
			"height": 550,
			"symbol": `FTX:${M.id.replace("-","")}`,
			"interval": "1",
			"timezone": "Etc/UTC",
			"theme": "dark",
			"style": "1",
			"locale": "en",
			"toolbar_bg": "#f1f3f6",
			"enable_publishing": false,
			"allow_symbol_change": true,
			"container_id": "tradingview"
		});
		ws.connect();
		socket.emit("ohlcs",M.id);
		socket.emit("orders",M.id);
		socket.emit("account",true);
		range.reset();
	}
	$('#symbol').change(updateM);
	updateM();
	socket.on("message",(ds,type) => {
		LF(ds,type)
	});
	socket.on("ohlcs",ds => {
		chart.bar.ohlc(ds);
	});
	socket.on("orders",ds => {
		for(let d of ds){
			chart.order.update(d);
		}
	});

	socket.on("account",ds => {
		A = ds;
		let p = A.positions.filter(p => p.future == M.id)[0];
		let size = 0;
		let pnl = 0;
		if(p){
			size = p.size;
			if(p.side != "buy"){
				size = -size;
			}
			pnl = p.unrealizedPnl
		}
		$("span.lot").text(size);
		$("span.pnl").text(pnl);
		let collateral = parseInt(A.freeCollateral * 100 ) / 100;
		$(".freeCollateral").text(collateral);
		$(".leverage").text(A.leverage);
		let max = A.leverage - 0.02;
		$("#sizeslider").attr('max',+max.toPrecision(10));
	});
	new Bindings(chart,socket,inputs);

	document.querySelectorAll('.form-outline').forEach((formOutline) => {
	  new mdb.Input(formOutline).init();
	});
});
