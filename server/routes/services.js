var 	$express = require('express'),
	 	router = $express.Router();


// Proxy requests
router.get('/proxy/:url', function(req, res){
	// TODO

	res.json({
		value: Math.random()
	});	
});


// Request for generating new pair token & session
router.post('/auth', function(req, res){
	// TODO

	res.sendStatus(200);
});



module.exports = router;