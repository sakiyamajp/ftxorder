class YAxis{
	constructor(chart){
		this.chart = chart;
		this.scale = d3.scaleLinear()
			.range([this.chart.jqsvg.height() - this.chart.margin.bottom, this.chart.margin.top]);
		let $axis = $('.axis');
		this.axis = chart.svg.append("g")
			.attr('class', 'axis')
		this.text = this.axis.append('text')
			// .text("USD")
			.attr('fill','currentcolor')
			.attr('text-anchor','end');
		this.marginRate = 0.2;
		keymage('v', () => {
			this.paddingEdit(true);
		});
		keymage('b', () => {
			this.paddingEdit(false);
		});
		let self = this;
		$(".padding span").on('click',function(e){
			self.paddingEdit($(this).data("zoom"));
		});
	}
	paddingEdit(plus){
		if(plus){
				this.marginRate += 0.1;
		}else{
			if(this.marginRate <= 0.2){
				return;
			}
			this.marginRate -= 0.1;
		}
		this.chart.draw();
	}
	resize(){
		let jqsvg = this.chart.jqsvg;
		this.axis.attr("transform", `translate(${jqsvg.width() - this.chart.margin.right},0)`);
		this.text.attr("transform", `translate(40,${jqsvg.height()-10})`);
	}
	update(ds){
		let max = d3.max(ds,d => d.h);
		let min = d3.min(ds,d => d.l);
		let margin = (max - min) * this.marginRate;
		this.scale.domain([min-margin,max+margin]);
		let axis = d3.axisRight(this.scale)
			.tickSize(-2000);
		this.axis.call(axis);
	}
}

class XAxis{
	constructor(chart){
		this.chart = chart;
		this.scale = d3.scaleBand()
			.padding(0.2);
		this.axis = chart.svg.append("g")
			.attr('class','x axis')
		this.text = this.axis.append("text");
		this.format = d3.timeFormat("%H:%M");
	}
	resize(){
		this.axis.attr("transform", `translate(0,${this.chart.jqsvg.height() - this.chart.margin.bottom})`);
	}
	update(min,max,resolution){
		let ticks = [];
		for(let i = min;i<=max;i+=resolution){
			ticks.push(i);
		}
		this.scale.domain(ticks);
		let span = resolution * parseInt(ticks.length / 10);
		let bottom = d3.axisBottom(this.scale)
			.ticks(10)
			.tickFormat(d => {
				if(d % span == 0){
					return this.format(d);
				}
			})
			// .tickSize(-2000);
		this.axis.call(bottom);
	}
}
class Cursor{
	constructor(chart){
		let svg = chart.svg;
		let jqsvg = chart.jqsvg;
		let margin = chart.margin;
		this.jqsvg = jqsvg;
		this.margin = margin;
		this.scale = chart.y.scale;
		this.g = svg
			.append("g")
			.attr("class","cursor");
		this.line = this.g
			.append("line")
			.attr("x1", 0)
			// .attr("x2", jqsvg.width() - margin.right);
		this.text = this.g
			.append("text")
			.attr("transform", `translate(0,-2)`);
		svg.on("mousemove", (event,d) => {
				this.update(event);
			})
			.on("mouseover", (event,d) => {
				this.g.style("display", "inline")
			})
			.on("mouseout", (event,d) => {
				this.g.style("display", "none")
			})
			.on("click", (event,d) => {
				let y = d3.pointer(event)[1];
				let price = this.getPrice(y);
				let ds = {
					type : "limit",
					price,
					buy : $('.buysell').data('buy')
				}
				jqsvg.trigger("order",ds);
			});
		$(".buysell").on('change', () => {
			this.updateBuySell();
		});
	}
	resize(){
		this.line
			.attr("x2", this.jqsvg.width() - this.margin.right);
	}
	updateBuySell(){
		this.line.attr('stroke',d => {
			if($('.buysell').data('buy')){
				return "#00b74a";
			}
			return "#f93154";
		});
	}
	getPrice(y){
		let price = this.scale.invert(y);
		let min = M.limits.price.min;
		price = parseInt(price / min) * min;
		price = +price.toPrecision(10)
		return price;
	}
	update(event,scale){
		let y = d3.pointer(event)[1];
		this.g.attr("transform", `translate(0,${y})`)
		let price = this.getPrice(y);
		this.text.text(price);
		this.updateBuySell();
	}
}
class Chart{
	constructor(){
		let margin = {top: 5, right: 50, bottom: 35, left: 20};
		this.margin = margin;
		this.area = $(".chart");
		let jqsvg = this.area.find("svg");
		this.jqsvg = jqsvg;
		this.svg = d3.select(jqsvg[0]);
		this.x = new XAxis(this);
		this.y = new YAxis(this);

		this.table = [];
		this.barCount  = 155;
		this.resolution = 60000;
		this.cacheMax = 1400;
		this.spread = this.svg
			.append("line")
			.attr("class","spread")

		this.cursor = new Cursor(this);
		this.svg
			.on("wheel", (event,d) => {
				this.wheel(event,d);
				event.preventDefault();
			});
		this.orders = {};
		$( window ).resize(() => {
			this.resize();
		});
		let self = this;
		// なんかおくらせないとずれる。
		setTimeout(()=>{
			self.resize();
		},500);
	}
	async removeCache(){
		while(true){
			while(this.table.length > this.cacheMax){
				this.table.shift();
			}
			await sleep(6000);
		}
	}
	order(d){
		if(d.market != M.id){
			return;
		}
		switch(d.status){
			case "new" :
			case "open" :
				this.orders[d.id] = d;
				break;
			case "closed" :
				if(this.orders[d.id]){
					delete this.orders[d.id];
				}
				break;
		}
		this.drawOrders();
	}
	wheel(event,d){
		let direction = event.wheelDelta < 0 ? 'down' : 'up';
		let span = 15;
		if(direction == "up"){
			if(this.barCount > 10){
				this.barCount -= span;
			}
		}else{
			if(this.barCount < this.cacheMax){
				this.barCount += span;
			}
		}
		this.draw();
	}
	resize(){
		this.jqsvg.height($(window).height()*.6);
		this.y.scale = this.y.scale.range([
			this.jqsvg.height() - this.margin.bottom,
			this.margin.top
		]);
		this.x.scale = this.x.scale.range([this.margin.left, this.jqsvg.width() - this.margin.right]);
		this.x.resize();
		this.y.resize();
		this.spread
			.attr("transform", `translate(${this.jqsvg.width() / 2 - this.margin.right},0)`)
			.attr("stroke-width", this.jqsvg.width());
		this.cursor.resize();
		this.draw();
	}
	tick(ds){
		this.spread
			.attr("y1", d => this.y.scale(ds.bid))
			.attr("y2", d => this.y.scale(ds.ask))
	}
	async ohlc(ds){
		this.table = ds;
		this.draw();
	}
	timeMinMax(){
		let now = +new Date();
		let max = now - now % this.resolution;
		max = Math.max(this.table[this.table.length-1].t,max);
		let min = max - this.resolution * this.barCount;
		return {min,max};
	}
	drawOrders(){
		let ds = Object.values(this.orders);
		let g = this.svg.selectAll(".order")
			.data(ds, d => d.id);
		g.exit()
			.remove();
		let g_enter = g.enter()
			.append("g")
			.attr("class","order");
		g_enter.append("line")
			.attr('class',d => d.side);
		let merged = g_enter.merge(g);
		merged.select("line")
			.attr("x1", 0)
			.attr("x2", d => this.jqsvg.width() - this.margin.right)
			.attr("y1", d => this.y.scale(d.price))
			.attr("y2", d => this.y.scale(d.price))
	}
	draw(){
		if(!this.table.length){
			return;
		}
		let {min,max} = this.timeMinMax();
		let ds = this.table.slice(
			this.table.length - this.barCount - 1,
			this.table.length
		);
		this.x.update(min,max,this.resolution);
		this.y.update(ds)

		let g = this.svg.selectAll(".bar")
			.data(ds, d => d.t);
		g.exit()
			.remove();
		let g_enter = g.enter()
			.append("g")
			.attr("class","bar");
		g_enter.append("line")
			.attr('class','hige');
		g_enter.append("line")
			.attr('class','body');
		let merged = g_enter.merge(g);
		merged.attr("transform", d => {
				return `translate(${this.x.scale(d.t) + this.x.scale.bandwidth() / 2},0)`
			})
			.attr("class", d => d.c >= d.o ? "bar yousen" : "bar");
		merged.select(".hige")
			.attr("y1", d => this.y.scale(d.l))
			.attr("y2", d => this.y.scale(d.h))
		merged.select(".body")
			.attr("y1", d => this.y.scale(d.o))
			.attr("y2", d => this.y.scale(d.c))
			.attr("stroke-width", this.x.scale.bandwidth());
		this.drawOrders();
	}
	executions(ds){
		for(let d of ds){
			let time = d.time - d.time % this.resolution;
			let last = this.table[this.table.length-1];
			if(last &&
				last.t == time){
				last.h = Math.max(last.h,d.price);
				last.l = Math.min(last.l,d.price);
				last.c = d.price;
				continue;
			}
			let o = last ? last.c : d.price;
			this.table.push({
				t : time,
				o,
				h : Math.max(o,d.price),
				l : Math.min(o,d.price),
				c : d.price,
			});
		}
		if(this.table.length < 10){
			return;
		}
		this.draw();
	}
}
