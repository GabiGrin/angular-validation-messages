/**
 * Created by Gabriel Grinberg on 6/13/14.
 */

(function () {
    'use strict';
    angular.module('gg.vmsgs')
        .directive('vmsg', function (ValidationsHelper, $compile, $timeout) {
            var defaultOptions = ValidationsHelper.defaultOptions,
                messageTriggers = ValidationsHelper.messageTriggers;

            return {
                scope: {
                    messages: '='
                },
                require: ['ngModel', '^vmsgForm', '^form'],
                compile: function (elm, attrs) {


                    return{
                        pre:function prelink(scope,elm,attrs){
                            scope.showMessage=false;
                            scope._forceShowMessage=false;
                            scope.errorMessage = '';
                        },
                        post:function link(scope, elm, attrs, ctrls) {

                            var ngModelCtrl = ctrls[0],
                                vtFormCtrl = ctrls[1],
                                options = {
                                    messageTrigger: attrs.messageTrigger || vtFormCtrl.getControlMessageTrigger() || defaultOptions.inputMessageTrigger
                                },
                                messageParent = $compile(defaultOptions.baseTemplate)(scope),
                                messageElement = $compile(attrs.notificationTemplate || vtFormCtrl.getNotificationTemplate() || defaultOptions.notificationTemplate)(scope);


                            messageParent.append(messageElement);
                            elm.after(messageParent);
                            elm.data('vtValidationNode', messageParent);

                            //set up the triggers that will show the message
                            switch (options.messageTrigger) {
                                case messageTriggers.onBlur:
                                    elm.on('blur', function () {
                                        scope.$apply(function () {
                                            showMessageIfNeeded();
                                        });
                                    });
                                    break;

                                /* TODO - decide if this trigger is needed. Doesn't sound useful
                                case messageTriggers.immediate:
                                    scope.$watch(function () {
                                        return ngModelCtrl.$valid;
                                    },function(){
                                        showMessageIfNeeded();
                                    });
                                    //$timeout(showMessageIfNeeded);//TODO - think why this is needed, because it doesn't work otherwise!
                                    break; */
                                case messageTriggers.onDirty:
                                    scope.$watch(function () {
                                        return ngModelCtrl.$viewValue
                                    }, function () {
                                        if (ngModelCtrl.$dirty) {
                                            showMessageIfNeeded();
                                        }
                                    });
                                    break;
                                case messageTriggers.dontShow:
                                    break;
                                default:
                                    throw new Error('Message trigger ' + options.messageTrigger + ' is not supported!');
                                    break;
                            }

                            scope.$watch(function () {
                                return ngModelCtrl.$valid;
                            }, function (isValid) {
                                if (isValid) {
                                    showMessageIfNeeded();
                                }

                            });

                            scope.forceShowMessage = function () {
                                scope._forceShowMessage = ngModelCtrl.$invalid;
                                scope.errorMessage = getMessage();
                            };

                            scope.hideMessage = function () {
                                scope._forceShowMessage = false;
                                scope.showMessage = false;
                            };

                            scope.$watch(function () {
                                return ngModelCtrl.$pristine;
                            }, function (isPristine) {
                                if (isPristine) {
                                    scope.showMessage = false;
                                    scope._forceShowMessage = false;
                                }
                            });

                            scope.setPristine = function () {
                                ngModelCtrl.$setPristine();
                            };

                            scope.isInvalid = function () {
                                return ngModelCtrl.$invalid;
                            };


                            //register the control into the parent directive
                            vtFormCtrl.addControl({control: scope, element: elm, messageElement: messageElement});


                            function showMessageIfNeeded() {
                                if (ngModelCtrl.$invalid) {
                                    scope.showMessage = true;
                                    scope.errorMessage = getMessage();
                                    elm.addClass(defaultOptions.errorClass);
                                    if (defaultOptions.parentErrorClass) elm.parent().addClass(defaultOptions.parentErrorClass);
                                }
                                else {
                                    scope.showMessage = false;
                                    scope.errorMessage = '';
                                    elm.removeClass(defaultOptions.errorClass);
                                    elm.parent().removeClass(defaultOptions.parentErrorClass);
                                }
                            }

                            function getMessage() {
                                var errors = [], fieldValue = ngModelCtrl.$viewValue, type, msg;
                                angular.forEach(ngModelCtrl.$error, function (val, key) {
                                    if (val) {
                                        errors.push(key);
                                    }
                                });
                                type = ValidationsHelper.getPrioritizedErrorType(errors);
                                msg = scope.messages && scope.messages[type] || vtFormCtrl.getMessage(type) || ValidationsHelper.getMessage(type);

                                return ValidationsHelper.renderMessage(msg, type, elm, attrs.fieldName, fieldValue);
                            }
                        }


                    }
                }
            }
        });
})();
