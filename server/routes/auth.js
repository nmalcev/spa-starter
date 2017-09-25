var 	$express = require("express"),
		$accounts = require('./../lib/accounts_provider'),
	 	router = $express.Router();

// Authorize user
router.post("/", function(req, res){
	var uid = req.body.login;
	
	if(uid && req.body.password && $accounts.compare(req.body.login, req.body.password)){
		var 	accountData = $accounts.get(uid),
				resData = {
					name: accountData.name,
					group: accountData.group,
					uid: uid,
				};

		res.setHeader('Set-Cookie', req.session.getAuthCookie(uid));
		res.json(resData);	
	}else{
		res.statusCode = 403;
		res.json({
			ec: 'auth_fail'
		});
	}
});

// Get current user data
router.get("/", function(req, res){
	var uid = req.session && req.session.uid;

	if(uid){
		res.json({
			name: 'nick',
			uid: uid,
			group: 1
		});	
	}else{
		res.sendStatus(403);
	}
});

// Logout user
router.post('/logout/', function(req, res){
	res.setHeader('Set-Cookie', req.session.getLogoutCookie());
	res.sendStatus(200);
});

module.exports = router;