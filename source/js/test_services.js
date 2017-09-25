import {app} from './app.js';

app.factory('MegaService', ['$http', function UserProfile($http){
	var _private = {};

	_private.session = localStorage['session'] || '1';
	_private.token = 'testtoken';

	return {
		download: function(){
			$http.get('http://localhost:9081/entry/proxy/abc', {
				headers: {
					'service-token': _private.token,
					'service-session': _private.session,
				},
				params: { 
					test: 'test'
				}
			}).then(function(resp){
				_private.session  = resp.headers('service-session');
				localStorage['session'] = _private.session;

				console.log('Completed newSession: %s', _private.session);
				console.dir(resp);
			}, function(resp){
				console.log('Rejected');
				console.dir(resp);
			});
		},
		// get new token and session
		authorize: function(){
			// TODO
		},
	};
}]);

app.controller('test-ctrl', ['$scope', 'MegaService', class{
	constructor($scope, MegaService){
		$scope.testProxy = function(){
			MegaService.download();
		};
	}
}]);

