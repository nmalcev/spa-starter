var 	$express = require('express'),
		$tokenProvider = require('./../providers/token_provider'),
	 	router = $express.Router();


// Proxy requests
router.get('/proxy/:url', function(req, res){
	// TODO
	// console.log('Debug /proxy/');
	// console.dir(req);

	res.json({
		value: Math.random()
	});	
});


// Request for generating new credentials (pair token & session)
router.post('/auth', function(req, res){
	let 	newCredentials = $tokenProvider.getNewToken();

	res.json(newCredentials);
});


module.exports = router;