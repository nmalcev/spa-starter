var 	$express = require("express"),
	 	router = $express.Router();


// Get random results
// @param req.query.citypattern - user search pattern
router.get('/', function(req, res){
	console.log('Request');
	console.dir(req);

	res.sendStatus(200);
});

module.exports = router;