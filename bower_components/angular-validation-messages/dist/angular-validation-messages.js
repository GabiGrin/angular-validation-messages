'use strict';
angular.module('gg.vmsgs', []);
;(function () {
  'use strict';
  function ValidationMessagesForm($parse) {
    return {
      restrict: 'A',
      require: 'form',
      priority: -1,
      compile: function () {
        return {
          pre: function preLink(scope, elem, attrs) {

            scope.formOpts = $parse(attrs.vmsgForm || '')(scope);
            scope.$watch(function () {
              return attrs.vmsgForm;
            }, function (opts){
              scope.formOpts = $parse(opts || '')(scope);
            });
          },
          post: function postLink(scope, elem, attrs, formCtrl) {
            elem.bind('submit', function (e) {
              if (formCtrl.$invalid) {
                e.stopImmediatePropagation();
                scope.$broadcast('submit');
              }
            });
          }
        };
      },
      controller: function ($scope) {
        this.getOptions = function () {
          return $scope.formOpts;
        };
      }
    };
  }

  angular.module('gg.vmsgs')
    .directive('vmsgForm', ['$parse', ValidationMessagesForm]);
})();

;/**
 * Created by Gabriel_Grinberg on 11/14/14.
 */
(function () {
  'use strict';
  function ValidationMessagesHelper($compile) {

    var defaultOptions = {
      hideClassName: 'ng-hide',
      messageClassName: 'validation-message',
      messageTemplate: '<span>{{errorMessage}}</span>',
      showTrigger: 'blur',
      hideTrigger: 'valid',

      //for overriding error messages
      errorMessages: {},

      //to support boostrap styling
      parentContainerClassName: 'form-group',
      parentErrorClassName: 'has-error'
    };

    return {
      setOptions: function (opts) {
        defaultOptions = angular.extend({}, defaultOptions, opts || {});
      },
      getOptions: function (opts, formOpts) {
        return angular.extend({}, defaultOptions, formOpts || {}, opts || {});
      },
      showTriggers: ['blur', 'submit', 'keydown'],
      hideTriggers: ['valid', 'keydown'],

      //these also define the order of rendering
      errorKeys: ['required', 'minlength', 'maxlength', 'pattern', 'min', 'max'],
      errorMessages: {
        required: {
          default: 'This field is required',
          email: 'A valid e-mail address is required',
          number: 'A valid number is required',
          date: 'A valid date is required',
          week: 'A valid week is required',
          url: 'A valid url is required',
          month: 'A valid month is required'
        },
        minlength: 'This field must be at least {minlength} chars',
        maxlength: 'This field must be at least {maxlength} chars',
        min: {
          default: 'This field must be higher than {min}',
          number: 'This number must be higher than {min}',
          date: 'This date must be after {min}',
          week: 'This week must be after {min}',
          month: 'This month must be after {min}'
        },
        max: {
          default: 'This field must be lower than {max}',
          number: 'This number must be lower than {max}',
          date: 'This date must be before {max}',
          week: 'This week must be before {max}',
          month: 'This month must be before {max}'
        },
        pattern: 'This field must match a specific pattern {pattern}'
      },
      renderError: function (msg) {
        var args;
        args = arguments;
        if (args.length === 2 && args[1] !== null && typeof args[1] === 'object') {
          args = args[1];
        }
        return msg.replace(/{([^}]*)}/g, function (match, key) {
          return (typeof args[key] !== 'undefined' ? args[key] : match);
        });
      },
      _getErrorMessage: function (errorKey, inputType, params, opts) {
        var errorMessageFromOpts = opts && opts.errorMessages && opts.errorMessages[errorKey];
        var errorMessageObject = errorMessageFromOpts || this.errorMessages[errorKey];

        if (errorMessageObject) {
          return this.renderError(errorMessageObject[inputType] || errorMessageObject.default || errorMessageObject, params);
        } else {
          throw 'Error message not supported for type ' + errorKey + ' and inputType ' + inputType;
        }
      },
      getRenderParameters: function (elem) {
        var params = {};
        ['minlength', 'maxlength', 'min', 'max', 'pattern'].forEach(function (attr) {
          var calculatedAttr = elem.attr(attr) || elem.attr('ng-' + attr);
          if (calculatedAttr) {
            params[attr] = calculatedAttr;
          }
        });
        return params;
      },
      getErrorMessage: function ($error, elem, opts) {
        var inputType = elem.attr('type');
        var selectedError = '';
        var renderParameters = this.getRenderParameters(elem);
        this.errorKeys.forEach(function (errorKey) {
          if (!selectedError && $error[errorKey]) {
            selectedError = errorKey;
          }
        });
        return this._getErrorMessage(selectedError, inputType, renderParameters, opts);
      },
      createMessageElement: function (scope, opts) {
        return $compile(opts.messageTemplate)(scope)
          .addClass(opts.messageClassName)
          .addClass(opts.hideClassName);
      }
    };
  }

  angular.module('gg.vmsgs')
    .factory('ValidationMessagesHelper', ['$compile', ValidationMessagesHelper]);
})();
;/**
 * Created by Gabriel_Grinberg on 11/15/14.
 */
'use strict';
(function () {
  function ModelDirective(ValidationMessagesHelper, $parse) {
    return {
      require: ['ngModel', '^vmsgForm'],
      restrict: 'A',
      compile: function () {
        return function postLink(scope, elem, attrs, ctrls) {
          var localOpts = $parse(attrs.vmsg || '')(scope);
          var formOpts = ctrls[1].getOptions();
          var opts = ValidationMessagesHelper.getOptions(localOpts, formOpts);
          var messageElem = ValidationMessagesHelper.createMessageElement(scope, opts);
          var ngModelCtrl = ctrls[0];
          var showMessageIfInvalid = function () {
            if (ngModelCtrl.$invalid) {
              window.ngModelCtrl = ngModelCtrl;
              messageElem.removeClass(opts.hideClassName);
              if (elem.parent().hasClass(opts.parentContainerClassName)){
                elem.parent().addClass(opts.parentErrorClassName);
              }
            }
          };
          var hideMessage = function () {
            messageElem.addClass(opts.hideClassName);
            if (elem.parent().hasClass(opts.parentContainerClassName)){
              elem.parent().removeClass(opts.parentErrorClassName);
            }
          };

          elem.data('message-element', messageElem);
          elem.after(messageElem);

          //set up show message trigger
          switch (opts.showTrigger) {
            case 'blur':
            case 'keydown':
              elem.on(opts.showTrigger, function () {
                showMessageIfInvalid();
              });
              break;
            case 'submit':
              //we always show the errors when its submitted.. this option is for clarify only
              break;
            default:
              throw 'Show trigger "' + opts.showTrigger + '" is not supported';
          }

          //we'll always show
          scope.$on('submit', function () {
            showMessageIfInvalid();
          });

          //set up hide message trigger
          switch (opts.hideTrigger) {
            case 'valid':
              scope.$watch(function () {
                return ngModelCtrl.$valid;
              }, function (isValid, wasValid) {
                if (isValid !== wasValid) {
                  hideMessage();
                }
              });
              break;
            case 'keydown':
              elem.on('keydown', function () {
                hideMessage();
              });
              break;
            default:
              throw 'Unsupported hide trigger used';
          }

          //each time the error changes, update the error message
          scope.$watch(function () {
            return ngModelCtrl.$error;
          }, function (newError) {
            if (ngModelCtrl.$invalid) {
              scope.errorMessage = ValidationMessagesHelper.getErrorMessage(newError, elem, opts);
            }
          }, true);

        };
      }
    };
  }

  angular.module('gg.vmsgs')
    .directive('vmsg', ['ValidationMessagesHelper', '$parse', ModelDirective]);
})();

