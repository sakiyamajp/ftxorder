class Bar{
	constructor(chart){
		this.chart = chart;
		this.ds = [];
		this.drawCount = 155;
		this.resolution = 300000;
		this.cacheMax = 700;
		this.chart.svg
			.on("wheel", event => {
				this.wheel(event);
				event.preventDefault();
			});
	}
	wheel(event){
		let direction = event.wheelDelta < 0 ? 'down' : 'up';
		let span = 15;
		if(direction == "up"){
			if(this.drawCount > 10){
				this.drawCount -= span;
			}
		}else{
			if(this.drawCount < this.cacheMax){
				this.drawCount += span;
			}
		}
		this.chart.draw();
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
