/**
 * Created by Gabriel_Grinberg on 11/15/14.
 */
(function () {
  'use strict';
  angular.module('gg.vmsgs')
    .directive('vmsg', function (ValidationMessagesHelper, $parse) {
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
            var elemParent = elem.parent();

            var showStatusMessage = function () {
              if (ngModelCtrl.$invalid) {
                window.ngModelCtrl = ngModelCtrl;
                messageElem.removeClass(opts.hideClassName);
                if (elem.parent().hasClass(opts.parentContainerClassName)) {
                  elemParent.addClass(opts.parentErrorClassName);
                }
              } else {
                if (elemParent.hasClass(opts.parentContainerClassName)) {
                  console.log('opts.parentSuccessClassName', opts.parentSuccessClassName);
                  elemParent.addClass(opts.parentSuccessClassName);
                }
              }
            };

            var hideMessage = function () {
              messageElem.addClass(opts.hideClassName);
              if (elemParent.hasClass(opts.parentContainerClassName)) {
                elemParent.removeClass(opts.parentErrorClassName);
                elemParent.removeClass(opts.parentSuccessClassName);
              }
            };

            elem.data('message-element', messageElem);
            elem.after(messageElem);

            //set up show message trigger
            switch (opts.showTrigger) {
              case 'blur':
              case 'keydown':
              case 'keyup':
                elem.on(opts.showTrigger, function () {
                  showStatusMessage();
                });
                break;
              case 'submit':
                //we always show the errors when its submitted.. this option is for clarification only
                break;
              default:
                throw 'Show trigger "' + opts.showTrigger + '" is not supported';
            }

            //we'll always show
            scope.$on('submit', function () {
              showStatusMessage();
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
              case 'keyup':
                elem.on(opts.hideTrigger, function () {
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
                messageElem.find('msg').text(ValidationMessagesHelper.getErrorMessage(newError, elem, opts));
              }
            }, true);

          };
        }
      };
    });
})();
