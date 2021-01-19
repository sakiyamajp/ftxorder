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
