(function(app, angular){
	'use strict';
	app.config(function($controllerProvider){
	    app.cp = $controllerProvider;
	});

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
					provide: function($cp){
						$cp.register('lazy', function($scope){
						    $scope.entry = 'World';
						    $scope.showBar = false;
						    $scope.toggle = function(){
						    	this.showBar = !this.showBar;
						    };
						});
					}
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
			settings: '=',
			onClose: '&',
		},
		controller: class{
			constructor($scope, $element, $attrs, $document, $compile){
				this.scope = $scope;
				this.doc = $document[0];
				$element[0].focus();
				this.compile = $compile;
				this.code = '';
				this.el = $element;

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
			$onInit(){
				if(this.doc.body.overflow != 'hidden'){
					this.doc.documentElement.style.overflow = 'hidden';
					this.doc.body.overflow = 'hidden';	
					this._bodyhooked = true;
				}

				if(this.settings.provide){
					this.settings.provide(app.cp);
				}

				this.code = this.settings.body;
			}
			onClick(e){
				e.stopPropagation();
			}
		},
		template: `
		<div class="ui-ppp_wrap">
			<div class="ui-ppp_content" ng-click="$ctrl.onClick($event)">
				<h3 class="ui-ppp_header">{{$ctrl.settings.title}}</h3>
				<render-html html="$ctrl.code"></render-html>
				<div class="wrap"></div>
				<div ng-click="$ctrl.close()">[x]</div>
			</div>
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
				if(e.keyCode == 27){
					this.remove(data);
				}
			}
		}],
		template: '<popup-wrap class="ui-ppp" ng-repeat="data in $ctrl.stack" settings="data" on-close="$ctrl.remove(data)" ng-click="$ctrl.remove(data)" tabindex="0" ng-keydown="$ctrl.onKeyDown($event, data)"></popup-wrap>',
	});

angular.module('app')
	.directive('renderHtml', ['$compile', function($compile){
		return {
			restrict: 'E',
			scope: {
				html: '='
			},
			link: function postLink(scope, element, attrs){
				function appendHtml(){
					if(scope.html) {
						var newElement = angular.element(scope.html);
						$compile(newElement)(scope);
						// element.append(newElement);
						element.replaceWith(newElement);
					}
				}

				scope.$watch(function(){ 
					return scope.html 
				}, appendHtml);
			}
		};
	}]);

//--------------------------------------------------------------------------------

}(angular.module('app', []), angular));