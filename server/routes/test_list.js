var 	$express = require("express"),
		$rand = require('./../lib/randoms'),
	 	router = $express.Router();


// Get random results
// @param req.query.citypattern - user search pattern
router.get('/', function(req, res){
	var results;

	if(typeof(req.query.citypattern) == 'string' && !!req.query.citypattern){
		// return one "correct" result for long string
		if(req.query.citypattern.length > 10){
			results = [{
				id: 0,
				name: req.query.citypattern
			}];
		}else if(req.query.citypattern.length > 0){
			results = $rand.array($rand.int(3,15)).map((x,i)=>({id:i,name:$rand.string($rand.int(10,20))}))
		}else{
			resulsts = [];
		}
	}
	
	res.json({
		result: results
	});	
});

module.exports = router;