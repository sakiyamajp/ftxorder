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
