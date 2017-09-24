var 	$tokens = require('./token_provider');


const 	TOKEN_HEADER = 'service-token',
		SESSION_HEADER = 'service-session';


module.exports = function(req, res, next){
	var newSecret = $tokens.validate(req.headers[TOKEN_HEADER], req.headers[SESSION_HEADER]);

	if(newSecret){
		req.serviceSession = 1; // TODO change on normal status, authorize user to connect to services
		res.setHeader(SESSION_HEADER, newSecret); // update secret 
		next();
	}else{
		// Forbidden
		res.sendStatus(403);
	}
}
