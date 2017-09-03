(function(app){
	'use strict';

	app.controller('city-search', class{
		constructor($scope){
			$scope.selectedcity = '';
		}
	});

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

	app.component('citySearchSelect', {
		bindings: {
			'selectedvalue': '=',
		}, 
		template: `
			<input class="search-select_input" type="text" ng-input="$ctrl.onInput($event)" ng-model="$ctrl.input" ng-change="$ctrl.onInput()"/>
			<div class="search-select_results">
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

}(angular.module('app', [])));