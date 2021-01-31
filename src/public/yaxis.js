class YAxis{
	constructor(chart){
		this.chart = chart;
		this.scale = d3.scaleLinear();
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
