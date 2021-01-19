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
