/**
 * Created by Gabriel Grinberg on 6/13/14.
 */
angular.module('validations')
    .directive('vt', function (ValidationsHelper, $compile,$timeout) {
        var defaultOptions = ValidationsHelper.defaultOptions,
            messageTriggers = ValidationsHelper.messageTriggers;

        return {
            scope: {
            },
            require: ['ngModel', '^vtForm', '^form'],
            compile: function (elm, attrs) {


                return function link(scope, elm, attrs, ctrls) {

                    var ngModelCtrl = ctrls[0],
                        vtFormCtrl = ctrls[1],
                        options = {
                            messageTrigger: attrs.messageTrigger || vtFormCtrl.getControlMessageTrigger() || defaultOptions.inputMessageTrigger
                        },
                        messageParent = $compile(defaultOptions.baseTemplate)(scope),
                        messageElement = $compile(attrs.notificationTemplate || vtFormCtrl.getNotificationTemplate()|| defaultOptions.notificationTemplate)(scope);


                    messageParent.append(messageElement);
                    elm.after(messageParent);
                    elm.data('vtValidationNode',messageParent);

                    scope.showMessage = false;
                    scope._forceShowMessage = false;
                    scope.errorMessage = '';

                    window.dirScope = scope;

                    //set up the triggers that will show the message
                    switch (options.messageTrigger) {
                        case messageTriggers.onBlur:
                            elm.on('blur', function () {
                                scope.$apply(function () {
                                    showMessageIfNeeded();
                                });
                            });
                            break;
                        case messageTriggers.immediate:
                            scope.$watch(function () {
                                return ngModelCtrl.$viewValue
                            }, showMessageIfNeeded);
                            $timeout(showMessageIfNeeded);//TODO - think why this is needed, because it doesn't work otherwise!
                            break;
                        case messageTriggers.onDirty:
                        {
                            scope.$watch(function () {
                                return ngModelCtrl.$viewValue
                            }, function () {
                                if (ngModelCtrl.$dirty) {
                                    showMessageIfNeeded();
                                }
                            })
                        }
                            break;
                    }

                    scope.forceShowMessage = function () {
                        scope._forceShowMessage = ngModelCtrl.$invalid;
                        scope.errorMessage = getMessage();
                    };

                    scope.hideMessage=function(){
                        scope._forceShowMessage=false;
                        scope.showMessage=false;
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
                        }
                        else {
                            scope.showMessage = false;
                            scope.errorMessage = '';
                            elm.removeClass(defaultOptions.errorClass);
                        }
                    }

                    function getMessage() {
                        var errors = [], fieldValue = ngModelCtrl.$viewValue, type;
                        angular.forEach(ngModelCtrl.$error, function (val, key) {
                            if (val) {
                                errors.push(key);
                            }
                        });
                        type = ValidationsHelper.getPrioritizedErrorType(errors);


                        return ValidationsHelper.renderMessage(type, elm, attrs.fieldName, fieldValue);
                    }
                }
            }
        }
    });
