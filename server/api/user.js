var 	$express = require("express"),
	 	router = $express.Router(),
	 	$accounts = require('./../lib/accounts_provider');

// create user: /api/user/
router.post("/:uid/", function(req, res){
	var 	uid = req.params.uid,
			status = 403;

	if(uid){
		if(uid && req.body.gid && req.body.name && req.body.pass){
			// create new user	
			$accounts.set(uid, req.body.gid, req.body.name, req.body.pass);
			status = 200;
		}else{
			// If some thing wrong send 400 
			status = 400;
		}
	}
	res.sendStatus(status);
});

module.exports = router;

