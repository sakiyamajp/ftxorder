class Bindings{
	constructor(chart,socket,inputs){
		this.chart = chart;
		this.socket = socket;
		this.inputs = inputs;
		this.buttons();
		this.keys();
		this.order();
	}
	order(){
		let self = this;
		$("svg").on('order',function(event,ds){
			ds = self.appendInputs(ds);
			socket.emit("order",ds);
		});
	}
	appendInputs(ds){
		ds.market = M.id;
		let inputs = this.inputs.ds;
		ds.size = +inputs.size;
		ds.reduceOnly = inputs.reduce;
		if(ds.type == "limit"){
			ds.postOnly = inputs.post;
			ds.ioc = inputs.ioc;
		}
		return ds;
	}
	buttons(){
		let socket = this.socket;
		let inputs = this.inputs;
		let self = this;
		$("#omb,#oms,#olb,#ols").on('click',function(){
			let ds = {
				type : $(this).data('type'),
				buy : $(this).data('buy')
			}
			ds = self.appendInputs(ds);
			if(ds.type == "limit"){
				ds.price = ds.buy ? M.tick.bid : M.tick.ask;
			}else{
				ds.price = null;
			}
			socket.emit("order",ds);
		});
		$("#omc,#olc").on('click',function(){
			let ds = {
				type : $(this).data('type'),
			}
			ds = self.appendInputs(ds);
			if(ds.type == "limit"){
				ds.price = ds.buy ? M.tick.bid : M.tick.ask;
			}else{
				ds.price = null;
			}
			let now = +$("span.lot").text();
			if(now == 0){
				return;
			}
			ds.buy = now < 0;
			ds.size = Math.abs(now);
			socket.emit("order",ds);
		});
		$(".buysell span").on('click',function(){
			if(!$(this).hasClass('disabled')){
				return;
			}
			self.toggleBuySell();
		});
		let chart = this.chart;
		$("#cancel").on('click',function(){
			socket.emit("cancel",Object.keys(chart.order.ds));
		});
		$("svg").on('cancel',function(event,id){
			socket.emit("cancel",[id]);
		});
		$("#cancel").on('click',function(){
			socket.emit("cancel",Object.keys(chart.order.ds));
		});
	}
	toggleBuySell(){
		$(".buysell span").toggleClass("disabled");
		let sell = $(".buysell .buy").hasClass("disabled");
		$(".buysell").data("buy",!sell);
		$(".buysell").trigger("change");
	}
	keys(){
		let ds = {
			esc : e => {
				$("#cancel").click();
			},
			z : () => {
				$("#reduce").click();
			},
			x : () => {
				$("#post").click();
			},
			c : () => {
				$("#ioc").click();
			},
			f : () => {
				$("#omb").click();
			},
			"-" : () => {
				$("#omc").click();
			},
			j : () => {
				$("#oms").click();
			},

			q : () => {
				$("#olb").click();
			},
			w : () => {
				$("#olc").click();
			},
			e : () => {
				$("#ols").click();
			},

			tab : () => {
				this.toggleBuySell();
			},
		};
		for(let key in ds){
			keymage(key, e => {
				if($("#size,#symbol").is(":focus")){
					return;
				}
				ds[key]();
				e.stopPropagation();
				e.preventDefault();
			});
		}
	}
}
