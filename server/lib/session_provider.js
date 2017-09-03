// Session Provider
var   	crc32 = require('crc').crc32,
		$accounts = require('./accounts_provider');

////////////////////////////////////////////////
// Session
////////////////////////////////////////////////
function Cookie2(header, secret, sidName){
	this.cookies = this.parse(header || '');

	var 	key = this.SIGN_PREFIX + sidName,
			value = this.cookies[key],
			hash;

	if(this.cookies[key]){
		pos = value.indexOf('.');
		
		if(pos != -1){
			hash = value.substr(pos + 1);
			value = value.substr(0, pos);	
		}
	}
	this.value = value || '';
	this.key = sidName;
	this.hash = hash;
	this.secret = secret;
	this.uid = hash == crc32(value + secret).toString(16) && value;
}
Cookie2.prototype.SIGN_PREFIX = 's:';
Cookie2.prototype.PAIR_SPL_PATTERN = /;\s*/;
Cookie2.prototype.parse = function(str){
	var   	pairs = str.split(this.PAIR_SPL_PATTERN),
	    	segment, key, value,
	    	pos,
	    	data = Object.create(null),
	    	i = pairs.length;

	while(i-- > 0){
		segment = pairs[i];
		pos = segment.indexOf('=');
		key = segment.substr(0, pos).trim();
		val = segment.substr(++pos, segment.length).trim();

		if('"' == val[0]){
			val = val.slice(1, -1);
		}

		data[key] = val ? decodeURIComponent(val) : true;
	}
	return data;
}
Cookie2.prototype.serialize = function(name, value, conf){
	var 	header = name + "=" + value + '; Path=' + (conf.path || '/'),
			expires = conf.maxAge ? new Date(Date.now() + conf.maxAge) : conf.expires;

	if(expires) header += "; Expires=" + expires.toUTCString();
    if(conf.domain) header += "; Domain=" + conf.domain;
    if(conf.secure) header += "; Secure";
    if(conf.httpOnly) header += "; HttpOnly";

	return header;
}
// res.setHeader('Set-Cookie', 'test=abc; Path=/; Expires=Sun, 28 Jun 2016 02:12:41 GMT; HttpOnly');
Cookie2.prototype.getAuthCookie = function(uid){
	return this.serialize(this.SIGN_PREFIX + this.key, uid + '.' + crc32(uid + this.secret).toString(16), {
		maxAge: 90000, // 15m
		httpOnly: true
	});
}
Cookie2.prototype.getLogoutCookie = function(){
	return this.serialize(this.SIGN_PREFIX + this.key, '', {
		httpOnly: true,
		expires: new Date(0), // delete cookie
	});	
}

/*
- domain
	If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
	For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
	By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
- path
	If set, the session will be restricted to URLs underneath the given path.
	By default the path is "/", which means that the same sessions will be shared across the entire domain.
	For more details on path and domain, see http://en.wikipedia.org/wiki/HTTP_cookie or RFC 2109.
- expires
	Время истечения cookie. Интерпретируется по-разному, в зависимости от типа:
		Число — количество секунд до истечения. Например, expires: 3600 — кука на час.
		Объект типа Date — дата истечения.
	Если expires в прошлом, то cookie будет удалено.
	Если expires отсутствует или 0, то cookie будет установлено как сессионное и исчезнет при закрытии браузера.
*/

// Part of middleware
module.exports.sessionProvider = function(secret){
	return function(req, res, next){
		req.session = new Cookie2(req.headers.cookie, secret, 'sid');

		if(req.session.uid && !$accounts.get(req.session.uid)){ // if user was removed
			req.session.uid = null;
		}

		// console.log('Cookies %s', req.session.uid);
		// console.dir(req.session.cookies);
		next();
	}
}
