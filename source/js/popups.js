import {app} from './app.js';

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
});

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