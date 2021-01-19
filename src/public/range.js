class Range{
	constructor(){
		this.bind();
	}
	bind(){
		let self = this;
		$('#size').on('change',function(){
			let usd = $(this).val() * M.tick.last ;
			let leverage = usd / A.freeCollateral;
			leverage = parseInt(leverage*100) / 100;
			self.label(leverage);
			$("#sizeslider").val(leverage);
		});

		$('#sizeslider').on("input change",function(e){
			let leverage = $(this).val();
			self.label(leverage);
			let size = A.freeCollateral * leverage / M.tick.last;
			let min = M.limits.amount.min;
			size = parseInt(size / min) * min;
			size = +size.toPrecision(10);
			$('#size').val(size);
		});
	}
	async reset(){
		while(!M.tick){
			await sleep(100);
		}
		let min = M.limits.amount.min;
		$('#size')
			.attr('step',min)
			.val(min)
			.trigger("change");
	}
	label(leverage){
		leverage = d3.format(".2f")(leverage)
		$(".sizesliderlabel").text(`${leverage}x Account Leverage`);
	}
}
