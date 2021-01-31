class OrderBook{
	constructor(chart){
		this.chart = chart;
		this.ds = [];
		this.scale = d3.scaleLinear();
		this.max = 0;
		this.axis = chart.svg.append("g")
			.attr('class', 'orderbook axis')
			.attr("transform", `translate(0,20)`);
	}
	update(ds){
		if(ds.action == "partial"){
			this.max = 0;
			for(let side of ["bids","asks"]){
				this.ds[side] = {};
				for(let d of ds[side]){
					d.push(side == "bids");
					this.ds[side][d[0]] = d;
				}
			}
		}else if(ds.action == "update"){
			for(let side of ["bids","asks"]){
				for(let d of ds[side]){
					if(d[1] == 0){
						if(this.ds[side][d[0]]){
							delete this.ds[side][d[0]];
						}
					}else{
						d.push(side == "bids");
						this.ds[side][d[0]] = d;
					}
				}
			}
		}
		this.draw();
	}
	resize(width){
		this.scale.range([width, width*0.85]);
	}
	getDepthPrice(){
		let depth = $("#depth").val();
		if(!depth){
			return;
		}
		let prices = {
		};
		for(let side of ["bids","asks"]){
			let ds = Object.values(this.ds[side]);
			ds = ds.sort((a,b) => {
				if(side == "bids"){
					return b[0] - a[0]
				}else{
					return a[0] - b[0]
				}
			});
			let total = 0;
			let price;
			for(let d of ds){
				total += d[1];
				if(total >= depth){
					prices[side] = d[0];
					break;
				}
			}
		}
		this.depth = prices;
		return prices;
	}
	draw(){
		let all = Object.values(this.ds.bids)
			.concat(Object.values(this.ds.asks));
		let yscale = this.chart.y.scale;
		let ydomain = yscale.domain();
		if(!this.max){
			this.max = d3.max(all,d => d[1])*1.2;
		}
		let prices = this.getDepthPrice();
		let minusPrice = -this.max * 0.1;
		all.push([prices.bids,minusPrice,true,true])
		all.push([prices.asks,minusPrice,false,true])
		all = all.filter(d => ydomain[0] <= d[0] && d[0] <= ydomain[1])
		let xscale = this.scale;
		xscale.domain([0,this.max])
		let g = this.chart.svg.selectAll("line.orderbook")
			.data(all, d => d[0]);
		g.exit()
			.remove();
		let g_enter = g.enter()
			.append("line")
		let merged = g_enter.merge(g);
			merged
			.attr('class', d => {
				let cls = d[2] ? "bids orderbook" : "asks orderbook";
				if(d[3]){
					cls += " depth";
				}
				return cls;
			})
			.attr("y1", d => yscale(d[0]))
			.attr("y2", d => yscale(d[0]))
			.attr("x1", d => xscale(d[1]))
			.attr("x2", d => xscale(0))
		let axis = d3.axisTop(xscale)
			.ticks(5)
			.tickFormat(d => {
				if(d == 0){
					return "";
				}
				return d3.format("~s")(d);
			})
			.tickSize(-this.chart.ohlcarea.attr("height")+20);
		this.axis.call(axis);
	}
}
