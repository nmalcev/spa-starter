var 	$express = require('express'),
		$rContent = require('./server/lib/request_content'),
		$session = require('./server/lib/session_provider'),
		$accounts = require('./server/lib/accounts_provider');

var 	app = $express();

// Define index page
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/page/index.html');
});
// Bind static root
app.use($express.static(__dirname + '/static'));
// Use middleware
app.use($rContent.contentParser);
app.use($session.sessionProvider('abc'));

app.use('/api/auth', require('./server/api/auth'));
app.use('/api/user', require('./server/api/user'));
// Fake data
app.use('/api/cities', require('./server/api/test_list'));

$accounts.restore();

app.use('*', function(req, res){ 
	res.statusCode = 404;
	var accept = req.headers['accept'] || '';

	if(/text\/html/.test(accept)){
		// @TODO render 404 error page
		res.send('not found (404)');
	}else{
		res.send('not found');	
	}
});

var server = app.listen(9081, function(){
	var 	address  = server.address();

	console.log('Run at http://%s:%s', address.host || 'localhost', address.port);
});