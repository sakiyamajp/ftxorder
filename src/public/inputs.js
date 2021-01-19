class Inputs{
  constructor() {
		try{
			this.ds = JSON.parse(localStorage.getItem('ds'));
		}catch(e){
		}
		if(!this.ds){
			this.ds = {};
		}
		this.flush();
		this.fook();
  }
	flush(){
		for(let id in this.ds){
			let d = this.ds[id];
			let e = $('#'+id);
			let type = e.attr('type');
			switch(type){
				case "select" :
					e.find(`[value=${d}]`).attr('selected',true);
					break;
				case "checkbox" :
					if(d){
						e.attr('checked',true);
					}
					break;
				default:
					$('#'+id).val(d);
					break;
			}
		}
	}
	fook(){
		let self = this;
		$('input,select').on('change',function(){
			self.save();
		});
	}
	save(){
		let inputs = {};
		$('input,select').each(function(){
			let id = $(this).attr("id");
			if(id == "sizeslider"){
				return;
			}
			if($(this).is("[type='checkbox']")){
				inputs[id] = $(this).is(":checked")
			}else{
				inputs[id] = $(this).val();
			}
		});
		this.ds = inputs;
		localStorage.setItem('ds',JSON.stringify(this.ds));
	}
}
