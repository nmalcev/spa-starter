var 	$express = require('express'),
		$rContent = require('./server/middlewares/request_content'),
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

//--------------------------------------------------------------------------------
// Public
//--------------------------------------------------------------------------------
var public = app.use('/public', $session.sessionProvider('abc'));
public.use('/auth', require('./server/routes/auth'));
public.use('/user', require('./server/routes/user'));
$accounts.restore();
// app.use($session.sessionProvider('abc'));
// app.use('/api/auth', require('./server/routes/auth'));
// app.use('/api/user', require('./server/routes/user'));
// $accounts.restore();

// Fake data
app.use('/api/cities', require('./server/routes/test_list'));
// test headers
app.use('/api/test', require('./server/routes/test'));






// TODO move to separete module
//--------------------------------------------------------------------------------
// Entry
//--------------------------------------------------------------------------------
var		$tokens_middleware 	= require('./server/middlewares/tokens_middleware'),
		$services_routes 	= require('./server/routes/services'),
		$tokens 			= require('./server/providers/token_provider');

app.use('/entry', $tokens_middleware, $services_routes); // nested middlewares http://expressjs.com/en/guide/using-middleware.html
$tokens.restore(function(isSuccess){
	console.log('Tokens are loaded: %s', isSuccess);
});







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