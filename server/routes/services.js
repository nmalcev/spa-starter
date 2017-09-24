var 	$express = require('express'),
	 	router = $express.Router();

// Proxy requests
router.get('/proxy/:url', function(req, res){
	// TODO

	res.json({
		value: Math.random()
	});	
});

module.exports = router;