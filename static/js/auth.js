import {app} from './app.js';

app.controller('auth', ['$scope', class{
	constructor($scope){
			$scope.login = '';
		$scope.password = '';
		$scope.onSubmit = function(){
			console.log('[TRIG submit]');
			console.dir(arguments);
			console.dir($scope);

		}.bind(this);
	}
}]);