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

// ???? http://stepansuvorov.com/blog/2014/04/angularjs-interceptors-%D0%BF%D1%80%D0%B8%D0%BC%D0%B5%D1%80%D1%8B/
/*
app.factory('megaServiceSessionInjector', [function(){
	var sessionInjector = {
		request: function(config){
			console.log('BEFORE request');
			console.dir(config);
			// if(!SessionService.isAnonymus){
				// config.headers['x-session-token'] = SessionService.token;
			// }

			return config;
		}
	};
	return sessionInjector;
}]);
 
app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('megaServiceSessionInjector');
}]);
*/