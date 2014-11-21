/**
 * Created by Gabriel_Grinberg on 11/14/14.
 */
(function () {
  'use strict';
  angular.module('gg.vmsgs')
    .factory('ValidationMessagesHelper', function ($compile) {

      var defaultOptions = {
        hideClassName: 'ng-hide',
        messageClassName: 'validation-message',
        messageTemplate: '<span><msg></msg></span>',
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
        errorKeys: ['required', 'email', 'url', 'minlength', 'maxlength', 'pattern', 'min', 'max'],
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
          url: 'A valid url is required',
          email: 'A valid e-mail address is required',
          minlength: 'This field must be at least {minlength} chars',
          maxlength: 'This field must be less than {maxlength} chars',
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
    });
})();
