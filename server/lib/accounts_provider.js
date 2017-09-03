var	 	$fs = require('fs'),
		$crypto = require('crypto');

var 	ACCOUNTS_PATH = __dirname + '/accounts.json'; // todo get from settings module

var UserData = {
	accounts: {},
	store: function(cb){
		$fs.writeFile(ACCOUNTS_PATH, JSON.stringify(this.accounts, null, '\t'), function(d){
			cb && cb();
		});
	},
	restore: function(cb){
		$fs.readFile(ACCOUNTS_PATH, 'utf8', function(error, content){
			if(error){
				if(error.code == 'ENOENT'){ // if file not exist create them, and try again
					UserData.accounts = {};
					UserData.store();
				}
				cb && cb(false);	
			}else{
				var data;
				try{
					data = JSON.parse(content);
				}catch(e){
					data = {};
				}
				UserData.accounts = data;
				cb && cb(true);
			}
		});
	},
	set: function(uid, gid, name, pass){
		var md5sum = $crypto.createHash('md5');
		md5sum.update(uid + pass);

		this.accounts[uid] = {
			gid: gid,
			name: name,
			hash: md5sum.digest('hex')
		};
		this.store();
	},
	get: function(uid){
		return this.accounts[uid];
	},
	compare: function(uid, pass){
		if(this.accounts[uid]){
			var 	hash = this.accounts[uid].hash,
					md5sum = $crypto.createHash('md5');

			md5sum.update(uid + pass);
			return hash == md5sum.digest('hex');
		}else{
			return false;
		}
	}
};

module.exports = UserData;
