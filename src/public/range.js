class Range{
	constructor(){
		let self = this;
		$('#size').on('change',function(){
			let usd = $(this).val() * M.tick.last;
			if(M.spot){
				let quote = B.filter(d => d.coin == M.quoteId)[0];
				quote = quote ? quote.free : 0;
			}else{
				let leverage = usd / A.freeCollateral;
				leverage = parseInt(leverage*100) / 100;
				self.label(leverage);
				$("#sizeslider").val(leverage);
			}
		});

		$('#sizeslider').on("input change",function(e){
			if(M.spot){
			}else{
				let leverage = $(this).val();
				self.label(leverage);
				let size = A.freeCollateral * leverage / M.tick.last;
				let min = M.limits.amount.min;
				size = parseInt(size / min) * min;
				size = +size.toPrecision(10);
				$('#size').val(size);
			}
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
		if(M.spot){
		}else{
			leverage = d3.format(".2f")(leverage)
			$(".sizesliderlabel").text(`${leverage}x Account Leverage`);
		}
	}
}
