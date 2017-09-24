import {app} from './app.js';

app.controller('test-ctrl', ['$scope', '$http', class{
	constructor($scope, $http){
		var serviceSesion = localStorage['session'] || '1';

		$scope.testProxy = function(){
			$http.get('http://localhost:9081/entry/proxy/abc', {
				headers: {
					'service-token': 'testtoken',
					'service-session': serviceSesion,
				},
				params: { 
					test: 'test'
				}
			}).then(function(resp){
				serviceSesion  = resp.headers('service-session');
				localStorage['session'] = serviceSesion;

				console.log('Completed newSession: %s', serviceSesion);
				console.dir(resp);
			}, function(resp){
				console.log('Rejected');
				console.dir(resp);
			});
		};
	}
}]);

