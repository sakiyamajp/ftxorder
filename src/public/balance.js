$(async () => {
	let body = d3.select($(".balance tbody")[0])
	socket.on("balance",ds => {
		B = ds;
		let all = body.selectAll("tr")
			.data(ds, d => d.coin);
		all.exit()
			.remove();
		let trEnter = all.enter()
			.append("tr")
		let tds = [
			{
				cls : "coin",
				property : "coin"
			},
			{
				cls : "free",
				property : "free"
			},
			{
				cls : "without",
				property : "availableWithoutBorrow"
			},
			{
				cls : "total",
				property : "total"
			},
			{
				cls : "usd",
				property : "usdValue"
			},
		]
		for(let td of tds){
			trEnter
				.append("td")
				.attr("class",td.cls)
		}
		let merged = trEnter.merge(all);
		for(let td of tds){
			merged.select("td." + td.cls)
				.text(d => d[td.property]);
		}
	});
});
