var _rand = {
	string: function(size){
		var 	n = size,
				out = '';

		while(n-- > 0){
			out += (10 + ~~(Math.random() * 25)).toString(36); 
		}

		return out;
	},
	int: function(min, max){
		return Math.floor(Math.random() * (max - min)) + min;
	},
	item: function(list){
		var pos = this.int(0, list.length);

		return list[pos];
	},
	items: function(original){
		var 	i = this.int(1, original.length),
				list = [];

		while(i-- > 0) list.push(original[this.int(0, original.length - 1)]);
		
		return list;
	},
	bool: function(){
		return ~~(Math.random() * 10) % 2; 
	},
	array: function(size){
		return Array.apply(null, {length: size});
	},
	date: function(y1, m1, d1, y2, m2, d2){
		if(arguments.length > 0){
			return this.int(new Date(y1, m1, d1) - 0, new Date(y2, m2, d2) - 0);
		}else{
			return this.int(new Date(2016, 0, 1) - 0, Date.now());
		}
	},
};

module.exports = _rand;