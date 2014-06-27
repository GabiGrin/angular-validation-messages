/**
 * Created by Gabriel_Grinberg on 6/13/14.
 */


(function(){
 'use strict';
 angular.module('validations',[]);


})();

/**
 * Created by Gabriel_Grinberg on 6/13/14.
 */
angular.module('validations')
    .provider('ValidationsHelper', function () {
        var customMessageRenders = {
            minlength: function (fieldValue, element, fieldName) {
                var minimumLength = element.attr('ng-minlength');
                return '"' + fieldValue + '" is too short, at least ' + minimumLength + ' characters is required';
            },
            maxlength: function (fieldValue, element, fieldName) {
                var maximumLength = element.attr('ng-maxlength');
                return '"' + fieldValue + '" is too long, less than ' + maximumLength + ' characters is required';
            }
        };


        var errorMessages = {
                email: '%FieldValue%" is not a valid e-mail address. You must enter a valid email!',
                required: 'Field %FieldName% is required!',
                number: 'Please insert a valid number',
                fallback: 'There is a problem with this field. Please try again',
                min: 'This field must be higher than %minimum%',
                max: 'This field must be lower than %maximum%'
            },
            validMessages = {
                default: 'Good job!'
            },
            messageTriggers = {
                onBlur: 'blur',
                dontShow: 'none',
                immediate: 'immediate',
                onDirty: 'dirty'
            },
            defaultOptions = {
                inputMessageTrigger: messageTriggers.onBlur,
                scrollToFirstError: true,
                focusFirstError: true,
                scrollDistance: 50,
                scrollSpeed: 'fast',
                errorClass: 'validation-error',
                animationClass: '',
                baseTemplate: '<div ng-show="showMessage || _forceShowMessage"></div>',
                notificationTemplate: '<span class="small text-danger">{{errorMessage}}</span>'

            },
            typePriorities = {
                required: -1
            };


        this.setMessage = function (type, message) {
            errorMessages[type] = message;
            return this;
        };

        this.getMessage = function (type) {
            return errorMessages[type];
        };

        this.setCustomRenderer = function (type, fn) {
            customMessageRenders[type] = fn;
            return this;
        };

        this.getCustomRender = function (type) {
            return customMessageRenders[type];
        };

        this.setErrorClass = function (className) {
            defaultOptions.errorClass = className;
            return this;
        };

        this.setAnimationClass = function (className) {
            defaultOptions.animationClass = className;
            return this;
        };

        this.setTypePriority = function (type, priority) {
            if (isNaN(priority)) throw new Error('Priority must be a number');
            typePriorities[type] = priority;
            return this;
        };

        this.setNotificationTemplate = function (template) {
            if (!/{{\s*errorMessage\s*}}/.test(template)) {
                console.warn('Overriden templates must include {{errorMessage}} to properly display messages!');
            }
            defaultOptions.notificationTemplate = template;
        };

        this.setValidNotificationTemplate = function (template) {
            if (!/{{\s*validMessage\s*}}/.test(template)) {
                console.warn('Overriden templates must include {{validMessage}} to properly display messages!');
            }
            defaultOptions.validMessageTemplate = template;
        };


        this.$get = function () {
            //todo, separate to getType > getMessage > renderMessage

            var api = {
                getType: function (type, element) {
                    //add override to types based on the element. i.e, when an invalid number is entered, the error will be required and not number.
                    return element.attr('type') == 'number' ? 'number' : type;
                },
                getMessage: function (type) {
                    return errorMessages[type] || errorMessages.fallback;
                },
                renderMessage: function (message, type, element, fieldName, fieldValue) {
                    var msg = message
                        .replace('%FieldValue%', fieldValue)
                        .replace('%FieldName%', fieldName || '');

                    switch (type) {
                        case 'min':
                            msg.replace('%minimum%', element.attr('min'));
                            break;

                        case 'max':
                            msg.replace('%maximum%', element.attr('max'));
                            break;
                    }

                    return msg;
                },
                defaultOptions: defaultOptions,
                messageTriggers: messageTriggers,
                getPrioritizedErrorType: function (errors) {
                    errors.sort(function (a, b) {
                        return (typePriorities[b] || 0 ) - (typePriorities[a] || 0);
                    });
                    return errors[0];
                }
            };

            return api;
        };


    });



/**
 * Created by Gabriel Grinberg on 6/13/14.
 */
angular.module('validations')
    .directive('vt', function (ValidationsHelper, $compile,$timeout) {
        var defaultOptions = ValidationsHelper.defaultOptions,
            messageTriggers = ValidationsHelper.messageTriggers;

        return {
            scope: {
                messages:'='
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
                        var errors = [], fieldValue = ngModelCtrl.$viewValue, type,msg;
                        angular.forEach(ngModelCtrl.$error, function (val, key) {
                            if (val) {
                                errors.push(key);
                            }
                        });
                        type = ValidationsHelper.getPrioritizedErrorType(errors);
                        msg=scope.messages&&scope.messages[type] || vtFormCtrl.getMessage(type) || ValidationsHelper.getMessage(type);

                        return ValidationsHelper.renderMessage(msg,type, elm, attrs.fieldName, fieldValue);
                    }
                }
            }
        }
    });

/**
 * Created by Gabriel_Grinberg on 6/13/14.
 */
angular.module('validations')
    .directive('vtForm', function ($parse, ValidationsHelper) {
        var defaultOptions = ValidationsHelper.defaultOptions;
        return {
            restrict: 'A',
            require: 'form',
            scope: {
                notificationTemplate: '@',
                messages: '='
            },
            priority: -1, //get it before the ngsubmit
            controller: function ($scope) {
                var controls = $scope.controls = [];
                this.addControl = function (obj) {
                    controls.push(obj);
                };
                this.removeControl = function (elem) {
                    angular.forEach(controls, function (obj, i) {
                        if (elem.name == obj.elem.name) {
//                      console.log('removed control',elem);
                            controls.splice(i, 1);
                        }
                    })
                };
                this.getControlMessageTrigger = function () {
                    return $scope.controlsMessageTrigger;
                };

                this.getNotificationTemplate = function () {
                    return $scope.notificationTemplate;
                };

                this.getMessage = function (type) {
                    return $scope.messages && $scope.messages[type];
                };

            },
            compile: function () {

                return {
                    pre: function (scope, elm, attrs) {
                        scope.controlsMessageTrigger = attrs.controlsMessageTrigger;
                        scope.notificationTemplate = attrs.notificationTemplate;
                    },
                    post: function (scope, elm, attrs, formCtrl) {
                        //fixme -> does not work
                        var fn = $parse(attrs.submitError);


                        elm.bind('submit', function (e) {
                                formCtrl.$setDirty();

                                var invalidControl = getFirstInvalidControl(),
                                    animateClass = attrs.animationClass || defaultOptions.animationClass;

                                angular.forEach(scope.controls, function (controlObj) {
                                    scope.$apply(controlObj.control.forceShowMessage);
                                });


                                if (invalidControl) {
                                    //console.log('Form is not valid', formController, scope.controls);
                                    fn(scope, {$event: event});
                                    //fixme - this causes a dependency with jQuery. Couldn't cancel the even without it..
                                    e.stopImmediatePropagation();
                                    e.preventDefault();

                                    if (defaultOptions.scrollToFirstError) {
                                        $('body').animate({scrollTop: invalidControl.element.offset().top - defaultOptions.scrollDistance}, defaultOptions.scrollSpeed, null, function () {
                                            if (defaultOptions.focusFirstError) {
                                                invalidControl.element.focus();
                                            }
                                        })
                                    }
                                    else if (defaultOptions.focusFirstError) {
                                        invalidControl.element.focus();
                                    }

                                    if (animateClass) {
                                        console.log('ani', animateClass);
                                        angular.forEach(scope.controls, function (obj) {
                                            var msgElm = obj.messageElement;
                                            if (obj.control.isInvalid()) {
                                                msgElm.addClass(animateClass)
                                                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                                                    function () {
                                                        msgElm.removeClass(animateClass)
                                                    });
                                            }
                                        });
                                    }
                                }
                            }
                        );

                        scope.$watch(function () {
                            return formCtrl.$pristine;
                        }, function (isPristine, wasPristine) {
                            if (isPristine && isPristine != wasPristine) {
                                angular.forEach(scope.controls, function (controlObj) {
                                    controlObj.control.hideMessage();
                                });
                            }
                        });

                        function getFirstInvalidControl() {
                            var invalidControl = null;
                            angular.forEach(scope.controls, function (controlObj) {
                                if (!invalidControl && controlObj.control.isInvalid())
                                    invalidControl = controlObj;
                            });
                            return invalidControl;
                        }

                    }}

            }

        }
    });


