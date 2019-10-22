// client-side js

const app = angular.module('app', []);

app.service('apiService', function() {
	return {
		submitForm: function() {
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

app.controller('AppController', ['$scope', 'apiService', function($scope, apiService) {
	this.state = window.__INITIAL_STATE__;

	this.form = Object(this.state.form);

	this.formData = {};

	this.parse = function(content) {
		return content;
		return $interpolate(content)(this.formData);
	}

	this.updateForm = function(form) {
		console.log(form);
	}
}]);

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
		}],
		link: function($scope, $element, attrs, ctrl) {
			const input = $scope.inlineForm;

			ctrl.onUpdate = function() {
				$scope.update({ form: ctrl.form })
			}

			output = input.body.replace(/\n/g, '<br>');

			const fields = input.fields.reduce(function(obj, input) {
				obj[input.name] = '<input ng-change="vm.onUpdate()" ng-model="vm.form[\''+input.name+'\']" name="'+input.name+'" type="'+input.type+'" required="'+!!input.required+'" />';

				return obj;
			}, {});

			output = ctrl.$interpolate(output)(fields);

			output = ctrl.$compile('<div>'+output+'</div>')($scope);

			$element.replaceWith(output);
		}
	}
});

// const form = document.forms[0];
// const inputs = form.querySelectorAll('input,textarea');
// const button = document.getElementById('submitForm');
// const successMessage = document.getElementById('successMessage');
//
// const data = {
// };
//
// function updateFormData(key, value) {
//   data[key] = value;
//
//   const input = document.querySelector('input[name="'+key+'"],textarea[name="'+key+'"]');
//
//   input.value = data[key];
// }
//
// function sendForm() {
//   const xhttp = new XMLHttpRequest();
//   xhttp.onreadystatechange = function() {
//     if (this.readyState === 4) {
//       if (this.status == 200) {
//         const response = JSON.parse(xhttp.responseText);
//
//         if (response.success) {
//           button.setAttribute('disabled', false);
//           successMessage.style.display = 'block';
//           form.style.display = 'none';
//         } else {
//           button.setAttribute('disabled', false);
//         }
//       }
//     }
//   };
//   xhttp.open("POST", '/submit', true);
//   xhttp.setRequestHeader('Content-Type', 'application/json');
//   xhttp.send(JSON.stringify(data));
// }
//
// // iterate through every dream and add it to our page
// inputs.forEach(function(input) {
//   updateFormData(input.name, input.value);
//   input.addEventListener('input', function(event) {
//     updateFormData(input.name, event.target.value);
//   });
// });
//
// // listen for the form to be submitted and add a new dream when it is
// form.onsubmit = function(event) {
//   // stop our form submission from refreshing the page
//   event.preventDefault();
//   button.setAttribute('disabled', true);
//
//   sendForm();
// };