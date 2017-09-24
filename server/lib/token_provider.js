var	 	$fs = require('fs');


const 	TOKENS_PATH = __dirname + '/tokens.json'; // todo get from settings module


module.exports = {
	tokens: {},
	store: function(next){
		$fs.writeFile(TOKENS_PATH, JSON.stringify(this.tokens, null, '\t'), function(d){
			if(next) next();
		});
	},

	restore: function(next){
		$fs.readFile(TOKENS_PATH, 'utf8', function(error, content){
			if(error){
				if(error.code == 'ENOENT'){ // if file not exist create them, and try again
					this.tokens = {};
					this.store();
				}
				if(next) next(false);	
			}else{
				var 	data;

				try{
					data = JSON.parse(content);
				}catch(e){
					data = {};
				}
				this.tokens = data;
				if(next) next(true);
			}
		}.bind(this));
	},

	get: function(token){
		return this.tokens[token];
	},
	// @param {string} tokenId
	// @param {string} secret
	// @return {string?} newSecret;
	validate: function(tokenId, session){
		var 	token = this.get(tokenId),
				newSecret;

		console.log('[CALL validate] tokenId: [%s], session: [%s]', tokenId, session);
		console.dir(token);


		if(token){
			if(token.status == 1){ // not expired
				if(token.session == session){
					newSecret = ~~(10000 * Math.random());
					token.session = newSecret;
				}else{ // withdrawing of token
					token.status = 0;
				}
				this.store();
			}
		}

		return newSecret;
	}
};