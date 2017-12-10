import {app} from './../app.js';

class TypedEditable{
	constructor(scope, element, attrs, ngModel, window, document){
		this._scope = scope;
		this._element = element;
		this._attrs = attrs;
		this._ngModel = ngModel;
		this._window = window;
		this._document = document[0];
	}
	link(){
		this._element.attr('contenteditable', true);
        this.type_string = this._attrs.editableType || 'string';

        this._ngModel.$render = () => {
            let 	content_string_or_num = this._ngModel.$viewValue || this.getDefaultInitialValue();

            this._element.html(this.htmlspecialchars(content_string_or_num.toString()));
            this._scope.$evalAsync(() => {
            	this._ngModel.$setViewValue(content_string_or_num);	
            });
        };	
        this._element.on('keydown', (e) => {
        	if(e.keyCode == 13){
        		e.preventDefault();
        		e.stopPropagation();
        	}
        });
        this._element.on('input', (e) => {
        	// innerText more powerfull then textContent, because save \n as <br/> and so on (Verified at Chrome)
        	let 	content_string_or_num = this.parseValue(e.target.innerText);
            let 	pos = this.getPos();

            content_string_or_num = this.htmlspecialchars(content_string_or_num.toString());

            if(e.target.innerText != content_string_or_num){
            	this._element.html(content_string_or_num);
            	pos.sel.removeAllRanges();
				pos.sel.addRange(this.setCaretPos(pos.end - pos.size - 1));		
            }

            this._scope.$evalAsync(() => {
            	this._ngModel.$setViewValue(content_string_or_num);	
            });
        });

        this._scope.$on('$destroy', () => {
        	this._element.off();
        });
	}
	getDefaultInitialValue(){
		return this.type_string == 'int' ? 0 : '';		
	}
	parseValue(str_string){
		let content_string_or_num = str_string.replace(/\n/g, '');

        if (this.type_string == 'int') {
            content_string_or_num = parseFloat(content_string_or_num.replace(/\D/g, ''));
        }		
        return content_string_or_num || this.getDefaultInitialValue();
	}
    htmlspecialchars(str){
        return str ? str.replace(/[<>&]/g, function(m){
            return m == '<' ? '&lt;' : m == '>' ? '&gt;' : '&amp;';
        }) : '';
    }
    getPos(){
    	let 	sel = this._window.getSelection();
    	var		range = sel.getRangeAt(0);
		var		caretRange = range.cloneRange();

		caretRange.selectNodeContents(this._element[0]);
		caretRange.setEnd(range.endContainer, range.endOffset);

		return {
			end: caretRange.toString().length, // where selection ends IE11 results is differernt from Chrome (not contains \n)
			// end: caretRange.endOffset, // Buggi Work at IE11 and W3C, but without syntax highlighting!
			size: sel.toString().length, // selection length
			sel
		};
    }
    setCaretPos(pos){
		var		range = this._document.createRange();

		range.setStart(this._element[0].childNodes[0], pos);
		range.setEnd(this._element[0].childNodes[0], pos);
		range.collapse(false);

		return range;
	}
}

app.directive('editableType', ['$window', '$document', function($window, $document){
	return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            (new TypedEditable(scope, element, attrs, ngModel, $window, $document)).link();
        }
    };
}]);
// https://long2know.com/2017/05/angularjs-parsers-and-formatters/