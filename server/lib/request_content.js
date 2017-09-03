// Middleware for request body

///////////////////////////////////////////////////////////////////////////
// helpers
///////////////////////////////////////////////////////////////////////////
var 	_3986backmap = {
			'%21': '!',
			'%2A': '*',
			'%27': '\'',
			'%28': '(',
			'%29': ')',
		},
		_3986map = {
			'!': '%21',
			'*': '%2A',
			'\'': '%27',
			'(': '%28',
			')': '%29',
		};

function fromRfc3986(val){
	return decodeURIComponent(val.replace(/(%21|%2A|%27|%28|%29)/g, function(m){
		return _3986backmap[m];
	}));
}
function toRfc3986(val){
	return encodeURIComponent(val).replace(/[\!\*\'\(\)]/g, function(m){
		return this._3986map[m];
	});
}
function urlEncode(obj){
	var list = [];
	for(key in obj){
		list.push(toRfc3986(key) + '=' + toRfc3986(obj[key]));
	}
	return list.join('&');
}
function safe_json(str){
	try{
		return JSON.parse(str);
	}catch(e){
		return null;
	}
}
function urlDecode(str){
	var 	res = {},
			parts = str.split('&'),
			buf,
			key, 
			i = parts.length;

	while(i-- > 0){
		buf = parts[i].split('=');
		key = fromRfc3986(buf[0]);
		res[key] = fromRfc3986(buf[1] || '');
	}

	return res;
}
///////////////////////////////////////////////////////////////////////////
// contentParser 
///////////////////////////////////////////////////////////////////////////
module.exports.contentParser = function(req, res, next){
	var  	parts = (req.headers['content-type'] || '').toLowerCase().split(/;|\s+/g),
			charset, mime, pos
			i = parts.length;

	while(i-- > 0){
		pos = parts[i].indexOf('/'); 

		if(pos != -1){
			mime = parts[i];
		}else{
			pos = parts[i].indexOf('=');
			if(pos != -1){
				charset = parts[i].substr(pos + 1);
			}
		}
	}

	// console.log('mime: %s, charset: %s', mime, charset);

	var chunks = [];
	req.on('data', function(chunk) {
		chunks.push(chunk);
	});
	req.on('end', function(){
		var buffer = Buffer.concat(chunks).toString();
		chunks.length = 0;

		if(mime == 'application/json'){
			req.body = safe_json(buffer) || {};
		}else if(mime == 'application/x-www-form-urlencoded'){
			req.body = urlDecode(buffer);
		}
	
		next();
	});
};
