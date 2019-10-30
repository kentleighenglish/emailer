// client-side js

const app = angular.module('app', []);

app.service('apiService', function() {
	return {
		submitForm: function(data) {
			return new Promise(function(resolve, reject) {
				const xhttp = new XMLHttpRequest();
				xhttp.onreadystatechange = function() {
					if (this.readyState === 4) {
						if (this.status == 200) {
							const response = JSON.parse(xhttp.responseText);

							if (response.success) {
								resolve();
							} else {
								reject();
							}
						}
					}
				};
				xhttp.open("POST", '/submit', true);
				xhttp.setRequestHeader('Content-Type', 'application/json');
				xhttp.send(JSON.stringify(data));
			})
		}
	}
});

app.filter('numberToEnglish', numberToEnglish);

app.controller('AppController', ['$scope', 'apiService', function($scope, apiService) {
	this.state = window.__INITIAL_STATE__;

	this.form = Object(this.state.form);
	this.sending = false;
	this.formSent = false;
	this.formFailed = false;

	this.formData = {};
	this.email = '';

	this.editing = false;

	$scope.$on('editing', function($event, data) {
		this.editing = data.value;
	}.bind(this));

	this.parse = function(content) {
		return content;
		return $interpolate(content)(this.formData);
	}

	this.updateForm = function(form) {
		this.formData = Object(form);
	}

	this.submitForm = function() {
		this.sending = true;
		apiService.submitForm({
			formData: this.formData,
			email: this.email
		})
		.then(function() {
			this.formSent = true;
			this.sending = false;
			$scope.$apply();
		}.bind(this))
		.catch(function() {
			this.formFailed = true;
			this.sending = false;
			$scope.$apply();
		}.bind(this));
	}
}]);

app.directive('inlineField', function() {
	return {
		restrict: 'E',
		require: {
			ngModelCtrl: 'ngModel'
		},
		scope: {
			ngModel: '<',
			name: '@',
			placeholder: '@',
			type: '@',
			label: '@'
		},
		bindToController: true,
		controllerAs: 'vm',
		template: [
			'<span class="inlineField" ng-class="{ \'active\': vm.active }">',
				'<span class="inlineField__text" ng-show="!vm.editing" ng-click="vm.focus($event)">{{vm.ngModel}}</span>',
				'<div class="inlineField__input" ng-show="vm.editing">',
					'<label for="{{vm.name}}" ng-style="vm.labelStyle">{{vm.label}}</label>',
					'<input ng-trim="false" ng-blur="vm.setEditing(false)" ng-focus="vm.setEditing(true)" ng-change="vm.update()" ng-model="vm.ngModel" name="{{vm.name}}" type="{{vm.type}}" ng-attr-size="{{vm.sizeCalc()}}" required />',
				'</div>',
			'</span>'
		].join(''),
		controller: ['$element', '$rootScope', '$sce', function($element, $rootScope, $sce) {
			this.active = false;
			this.editing = false;

			function calculateMargin() {
				var label = $element.find('label');
				var width = document.body.clientWidth;

				leftPos = $element[0].offsetLeft;
				elWidth = label[0].clientWidth;
				margin = width - (leftPos + elWidth);
				return (0 > margin ? margin : 0) + 'px';
			}

			this.labelStyle = { marginLeft: calculateMargin(), maxWidth: document.body.clientWidth + 'px' };

			window.addEventListener('resize', function() {
				this.labelStyle = { marginLeft: calculateMargin(), 'maxWidth': document.body.clientWidth + 'px' };
			}.bind(this));

			$rootScope.$on('editing', function($event, data) {
				if (data.name === this.name && data.value === true) {
					this.active = true;
				} else {
					this.active = false;
				}
			}.bind(this));

			this.update = function() {
				this.ngModelCtrl.$setViewValue(this.ngModel);
			}
			this.focus = function($event) {
				this.setEditing(true);
				const input = $element.find('input');
				setTimeout(function() {
					input[0].focus();
				}.bind(this), 50);
			}
			this.setEditing = function(val, $event) {
				$rootScope.$broadcast('editing', { name: this.name, value: val });
				this.editing = !!val;
			}

			this.sizeCalc = function() {
				var size = 2;
				if (this.ngModel) {
					size = (this.ngModel.length || 0) * .8;
				}
				return size > 2 ? size : 2;
			}

		}]
	}
});

app.directive('inlineForm', function() {
	return {
		restrict: 'A',
		scope: {
			inlineForm: '<',
			form: '<',
			update: '&'
		},
		controllerAs: 'vm',
		controller: [ '$scope', '$compile', '$interpolate', function($scope, $compile, $interpolate) {
			this.$compile = $compile;
			this.$interpolate = $interpolate;

			this.editMode = false;
		}],
		link: function($scope, $element, attrs, ctrl) {
			const input = $scope.inlineForm;

			ctrl.onUpdate = function() {
				$scope.update({ form: ctrl.form })
			}

			const fields = input.fields.reduce(function(obj, input) {
				obj[input.name] = '<inline-field ng-model="vm.form[\''+input.name+'\']" ng-change="vm.onUpdate()" name="'+input.name+'" type="'+input.type+'" placeholder="'+input.placeholder+'" label="'+input.label+'" required />';

				return obj;
			}, {});

			output = ctrl.$interpolate(input.body)(fields);

			output = output.replace(/\n/g, '<br>');
			output = ctrl.$compile('<div>'+output+'</div>')($scope);

			$element.replaceWith(output);
		}
	}
});


app.directive('markdown', function() {
	return {
		restrict: 'A',
		scope: {
			'markdown': '<'
		},
		link: function($scope, $element) {
			var converter = new showdown.Converter();
			$scope.$watch(function() { return $scope.markdown }, function() {
				var markdown = converter.makeHtml($scope.markdown || '');

				$element.html(markdown);
			}, true);
		}
	}
});

/**
 * Convert an integer to its words representation
 *
 * @author McShaman (http://stackoverflow.com/users/788657/mcshaman)
 * @source http://stackoverflow.com/questions/14766951/convert-digits-into-words-with-javascript
 */
function numberToEnglish(n, custom_join_character) {

    var string = n.toString(),
        units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

    var and = custom_join_character || 'and';

    /* Is number zero? */
    if (parseInt(string) === 0) {
        return 'zero';
    }

    /* Array of units as words */
    units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
        end = start;
        chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
        return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

        chunk = parseInt(chunks[i]);

        if (chunk) {

            /* Split chunk into array of individual integers */
            ints = chunks[i].split('').reverse().map(parseFloat);

            /* If tens integer is 1, i.e. 10, then add 10 to units integer */
            if (ints[1] === 1) {
                ints[0] += 10;
            }

            /* Add scale word if chunk is not zero and array item exists */
            if ((word = scales[i])) {
                words.push(word);
            }

            /* Add unit word if array item exists */
            if ((word = units[ints[0]])) {
                words.push(word);
            }

            /* Add tens word if array item exists */
            if ((word = tens[ints[1]])) {
                words.push(word);
            }

            /* Add 'and' string after units or tens integer if: */
            if (ints[0] || ints[1]) {

                /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
                if (ints[2] || !i && chunksLen) {
                    words.push(and);
                }

            }

            /* Add hundreds word if array item exists */
            if ((word = units[ints[2]])) {
                words.push(word + ' hundred');
            }

        }

    }

    return words.reverse().join(' ');

}