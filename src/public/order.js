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
			.attr("class",d => ["order",d.side].join(" "));
		g_enter.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("y2", 0);
		g_enter.append("text")
			.text(d => d.price)
			.on('click',(event,d) => {
				this.chart.jqsvg.trigger("cancel",d.id);
			});
		let merged = g_enter.merge(g);
		let yscale = this.chart.y.scale;
		merged
			.attr("transform", d => `translate(0,${yscale(d.price)})`);
		merged.select("line")
			.attr("x2", d => this.chart.jqsvg.width() - this.chart.margin.right)
		merged.select("text")
			.attr("transform", d => `translate(${this.chart.jqsvg.width()-40},5)`)
	}
}
