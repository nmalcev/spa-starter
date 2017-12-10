import {app} from './app.js';

function debounce(_cb, _msec){
	var _pending;
	
	return function(args){
		if(_pending){
			clearTimeout(_pending);
		}
		_pending = setTimeout(function(){
			_cb(args);
		}, _msec);
	}
}

app.controller('city-search', ['$scope', 'popup', class{
	constructor($scope, $popup){
		$scope.selectedcity = '';

		$scope.onClick = function(){
			$popup.add({
				title: 'Example of Popup',
				body: 
				'<div ng-controller="lazy">'
				+ '<p>Hello <b>{{entry}}</b>!</p>'
				+ '<div class="test" ng-show="showBar"></div>'
				+ '<button ng-click="toggle()">Toggle</button>'
				+ '</div>',
				provide: function($register){
					$register.controller('lazy', function($scope){
					    $scope.entry = 'World';
					    $scope.showBar = false;
					    $scope.toggle = function(){
					    	this.showBar = !this.showBar;
					    };
					});
					// $controllerProvider.register(controllerName, controllerFunction);
				}
			});
		}
		$scope.onClick2 = function(){
			$popup.add({
				title: 'Example of Popup2',
				body: 
				`
					<div ng-controller="lazy as ctrl">
						<p ng-bind="count"></p>
						<p ng-bind="text"></p>

						<form>
							<div>
								<button ng-click="ctrl.increment()">+</button>	
								<span class="field-input __short" ng-model="count" editable-type="int"></span>
								<button ng-click="ctrl.decrement()">-</button>	

								<span class="field-input __short" ng-model="text" editable-type></span>
							</div>
							<div>
								<button type="reset">Reset</button>
								<button type="submit">Submit</button>
							</div>
						</form>
					</div>
				`,
				provide: function($register){
					$register.controller('lazy', class{
						constructor($scope){
							console.log('INIT');
							this.$scope = $scope;
							this.$scope.count = 0;
							this.$scope.text = '';


						}
						increment(){
							console.log('Increment');
							this.$scope.count++;
						}
						decrement(){
							let c = this.$scope.count - 1;
							this.$scope.count = c > 0 ? c : 0;
						}

					});

				}
			});
		}
	}
}]);

app.component('citySearchSelect', {
	bindings: {
		'selectedvalue': '=',
	}, 
	template: `
		<input class="search-select_input" type="text" ng-input="$ctrl.onInput($event)" ng-model="$ctrl.input" ng-change="$ctrl.onInput()"/>
		<div class="search-select_results" ng-show="$ctrl.results.length > 0">
			<city-search-variant class="search-select_variant" ng-repeat="result in $ctrl.results" data="result" on-select="$ctrl.select(result)"></city-search-variant>
		</div>
		`,
	controller: ['$scope', '$http', '$element', '$attrs', class{ // for initing scope
		constructor($scope, $http, $element, $attrs){
			this.input = '';
			this.$http = $http;

			this.fetch = debounce(function(query){
				this.$http.get('/api/cities', {
					params: {
						citypattern: query
					}
				}).then(function(resp){
					this.results = resp.data.result;

				}.bind(this));
			}.bind(this), 200);
		}
		select(selected){
			this.input = selected.name;
			this.results = [];
			// Share value to parent controller
			this.selectedvalue = selected.name;
		}
		onInput(){
			if(this.input.length > 0){
				this.fetch(this.input);
			}else{
				this.results = [];
			}
			
		}
	}]
});

app.component('citySearchVariant', {
	controller: class{
		constructor(){}
	},
	bindings: {
		data: '=',
		onSelect: '&',
	},
	template: '<div class="search-select_variant-inner" ng-click="$ctrl.onSelect($ctrl.data)">{{$ctrl.data.name}}</div>',
});