(function(app){
	'use strict';

	app.controller('city-search', ['$scope', 'popup', class{
		constructor($scope, $popup){
			$scope.selectedcity = '';

			$scope.onClick = function(){
				console.log('Click2');
				$popup.add({
					title: 'Popup ' + Math.random()
				});
			}
		}
	}]);

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

//--------------------------------------------------------------------------------
	
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

//--------------------------------------------------------------------------------

	// Implements popup engine

	app.factory('popup', class{
		constructor(){

		}
		add(conf){
			if(this.root){
				this.root.stack.push(conf);
			}else{
				console.warn('Popup factory haven\'t binded scope');
			}
		}
		bindRoot(scope){
			this.root = scope;
		}
	})
	app.component('popupWrap', {
		bindings:{
			settings: '<',
			onClose: '&',
		},
		controller: class{
			constructor($scope, $element, $attrs, $document){
				console.log('INIT popup-wrap');
				console.dir(arguments);
				this.scope = $scope;
				this.doc = $document[0];

				if(this.doc.body.overflow != 'hidden'){
					this.doc.documentElement.style.overflow = 'hidden';
					this.doc.body.overflow = 'hidden';	
					this._bodyhooked = true;
				}

				$element[0].focus();
			}
			close(){
				this.onClose();
			}
			$onDestroy(){
				if(this._bodyhooked){
					this.doc.documentElement.style.overflow = '';
					this.doc.body.overflow = '';
				}
			}

		},
		template: `
			<div class="ui-ppp_content" >
				<div style="border: 1px solid red;">{{$ctrl.settings.title}}</div>
				<div ng-click="$ctrl.close()">[x]</div>
			</div>
		`,
	});
	// Host container for popups
	app.component('popupRoot', {
		controller: ['$scope', '$element', '$attrs', 'popup', class{
			constructor($scope, $element, $attrs, $popup){
				this.stack = [];
				this.scope = $scope;
				$popup.bindRoot(this);
			}
			// Remove child popup
			remove(data){
				var pos = this.stack.findIndex(item => {
					return item.$$hashKey == data.$$hashKey;
				});

				if(pos != -1){
					this.stack.splice(pos, 1);
				}
			}
			onKeyDown(e, data){
				console.log('On keydown');
				console.dir(e);
				if(e.keyCode == 27){
					this.remove(data);
				}
			}
		}],
		template: '<popup-wrap class="ui-ppp" ng-repeat="data in $ctrl.stack" settings="data" on-close="$ctrl.remove(data)" tabindex="0" ng-keydown="$ctrl.onKeyDown($event, data)"></popup-wrap>',
	});

//--------------------------------------------------------------------------------

}(angular.module('app', [])));