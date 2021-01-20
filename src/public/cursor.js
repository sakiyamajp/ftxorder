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
		this.rect = this.g
			.append("rect")
			.attr("width", 50)
			.attr("height", 18)
		this.line = this.g
			.append("line")
			.attr("x1", 0)
		this.text = this.g
			.append("text")
		chart.ohlcarea.on("mousemove", (event,d) => {
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
	resize(width){
		this.line
			.attr("x2", width);
		this.text
			.attr("transform", `translate(${width+5},4)`);
		this.rect
			.attr("transform", `translate(${width+1},-9)`);
	}
	updateBuySell(){
		this.g.attr('class', d => {
			let cls = ["cursor"];
			if($('.buysell').data('buy')){
				cls.push("buy");
			}else{
				cls.push("sell");
			}
			return cls.join(' ');
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
