class Chart{
	constructor(){
		let margin = {top: 5, right: 100, bottom: 35, left: 20};
		this.margin = margin;
		this.jqsvg = $(".chart svg");
		this.svg = d3.select(this.jqsvg[0]);
		this.x = new XAxis(this);
		this.y = new YAxis(this);

		this.ohlcarea = this.svg
			.append("rect")
			.attr("class","ohlcarea")

		this.bar = new Bar(this);
		this.spread = this.svg
			.append("line")
			.attr("class","spread")

		this.cursor = new Cursor(this);
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

	resize(){
		this.jqsvg.height($(window).height()*.6);

		let width = this.jqsvg.width() - this.margin.right;
		let height = this.jqsvg.height() - this.margin.bottom;

		this.ohlcarea
			.attr("width",width)
			.attr("height",height)

		this.y.scale = this.y.scale.range([
			height,
			this.margin.top
		]);
		this.x.scale = this.x.scale.range([this.margin.left, width]);
		this.x.resize();
		this.y.resize();
		this.spread
			.attr("transform", `translate(${width/2},0)`)
			.attr("stroke-width", width);
		this.cursor.resize(width);
		this.draw();
	}
	tick(ds){
		this.spread
			.attr("y1", d => this.y.scale(ds.bid))
			.attr("y2", d => this.y.scale(ds.ask))
	}
	draw(){
		if(this.bar.ds.length < 10){
			return;
		}
		let now = +new Date();
		let bar = this.bar;
		let max = now - now % bar.resolution;
		max = Math.max(bar.ds[bar.ds.length-1].t,max);
		let min = max - bar.resolution * bar.drawCount;

		let ds = this.bar.ds.filter(d => d.t >= min);
		this.x.update(min,max,this.bar.resolution);
		this.y.update(ds)
		this.bar.draw(ds);
		this.order.draw();
	}
}
