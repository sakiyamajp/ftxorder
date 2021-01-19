class Order{
	constructor(chart){
		this.chart = chart;
		this.ds = {};
	}
	update(d){
		if(d.market != M.id){
			return;
		}
		switch(d.status){
			case "new" :
			case "open" :
				this.ds[d.id] = d;
				break;
			case "closed" :
				if(this.ds[d.id]){
					delete this.ds[d.id];
				}
				break;
		}
		this.draw();
	}
	draw(){
		let ds = Object.values(this.ds);
		let g = this.chart.svg.selectAll(".order")
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
			.attr("x2", d => this.chart.jqsvg.width() - this.chart.margin.right)
			.attr("y1", d => this.chart.y.scale(d.price))
			.attr("y2", d => this.chart.y.scale(d.price))
	}
}
class Bar{
	constructor(chart){
		this.chart = chart;
		this.ds = [];
		this.drawCount = 155;
		this.resolution = 60000;
		this.cacheMax = 700;
	}
	update(ds){
		for(let d of ds){
			let time = d.time - d.time % this.resolution;
			let last = this.ds[this.ds.length-1];
			if(last &&
				last.t == time){
				last.h = Math.max(last.h,d.price);
				last.l = Math.min(last.l,d.price);
				last.c = d.price;
				continue;
			}
			let o = last ? last.c : d.price;
			this.ds.push({
				t : time,
				o,
				h : Math.max(o,d.price),
				l : Math.min(o,d.price),
				c : d.price,
			});
		}
		this.chart.draw();
	}
	async ohlc(ds){
		this.ds = ds;
		this.chart.draw();
	}
	async removeCache(){
		while(true){
			while(this.ds.length > this.cacheMax){
				this.ds.shift();
			}
			await sleep(6000);
		}
	}
	draw(ds){
		let xscale = this.chart.x.scale;
		let yscale = this.chart.y.scale;
		let g = this.chart.svg.selectAll(".bar")
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
				return `translate(${xscale(d.t) + xscale.bandwidth() / 2},0)`
			})
			.attr("class", d => d.c >= d.o ? "bar yousen" : "bar");
		merged.select(".hige")
			.attr("y1", d => yscale(d.l))
			.attr("y2", d => yscale(d.h))
		merged.select(".body")
			.attr("y1", d => yscale(d.o))
			.attr("y2", d => yscale(d.c))
			.attr("stroke-width", xscale.bandwidth());
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
		this.bar = new Bar(this);
		this.spread = this.svg
			.append("line")
			.attr("class","spread")

		this.cursor = new Cursor(this);
		this.svg
			.on("wheel", (event,d) => {
				this.wheel(event,d);
				event.preventDefault();
			});
		this.order = new Order(this);
		$( window ).resize(() => {
			this.resize();
		});
		let self = this;
		// なんかおくらせないとずれる。
		setTimeout(()=>{
			self.resize();
		},500);
	}
	wheel(event,d){
		let direction = event.wheelDelta < 0 ? 'down' : 'up';
		let span = 15;
		if(direction == "up"){
			if(this.bar.drawCount > 10){
				this.bar.drawCount -= span;
			}
		}else{
			if(this.bar.drawCount < this.bar.cacheMax){
				this.bar.drawCount += span;
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
	timeMinMax(){
		let now = +new Date();
		let bar = this.bar;
		let max = now - now % bar.resolution;
		max = Math.max(bar.ds[bar.ds.length-1].t,max);
		let min = max - bar.resolution * bar.drawCount;
		return {min,max};
	}
	draw(){
		if(this.bar.ds.length < 10){
			return;
		}
		let {min,max} = this.timeMinMax();
		let index;
		let ds = this.bar.ds.filter(d => d.t >= min);
		this.x.update(min,max,this.bar.resolution);
		this.y.update(ds)
		this.bar.draw(ds);
		this.order.draw();
	}
}
