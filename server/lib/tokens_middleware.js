var 	$tokens = require('./token_provider');


const 	TOKEN_HEADER = 'service-token',
		SESSION_HEADER = 'service-session';

function getIp(req){
	var forwardHeaders = req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']; // 'client, proxy1, proxy2, ..., proxyN'

	// TODO
	if(forwardHeaders){
		return forwardHeaders.split(',')[0].trim(); // 
	}else{
		return req.connection.remoteAddress ||req.socket.remoteAddress || req.connection.socket.remoteAddress;
	}
}


module.exports = function(req, res, next){
	// TODO validate by ip adress
	var newSecret = $tokens.validate(req.headers[TOKEN_HEADER], req.headers[SESSION_HEADER], getIp(req));

	if(newSecret){
		req.serviceSession = 1; // TODO change on normal status, authorize user to connect to services
		res.setHeader(SESSION_HEADER, newSecret); // update secret 
		next();
	}else{
		// Forbidden
		res.sendStatus(403);
	}
}
