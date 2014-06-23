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


        var messages = {
                email: '%FieldValue%" is not a valid e-mail address. You must enter a valid email!',
                required: 'Field %FieldName% is required!',
                number: 'Please insert a valid number',
                fallback: 'There is a problem with this field. Please try again',
                min: 'This field must be higher than %minimum%',
                max: 'This field must be lower than %maximum%'
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
            messages[type] = message;
            return this;
        };

        this.getMessage = function (type) {
            return messages[type];
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
            defaultOptions.notificationTemplate=template;
        };


        this.$get = function () {
            return {
                renderMessage: function (type, element, fieldName, fieldValue) {
                    var controlType = element.attr('type'),
                        msg = '';

                    switch (type) {
                        case 'min':
                            msg = getMessage(type)
                                .replace('%minimum%', element.attr('min'));
                            break;

                        case 'max':
                            msg = getMessage(type)
                                .replace('%maximum%', element.attr('max'));
                            break;
                        default:
                            if (controlType == 'number') msg = getMessage('number');
                            else if (customMessageRenders[type]) {
                                msg = customMessageRenders[type](fieldValue, element, fieldName);
                            }
                            else msg = getMessage(type);
                            break;
                    }

                    return msg;


                    function getMessage(type) {
                        var msg = messages[type] || messages.fallback;
                        return msg
                            .replace('%FieldValue%', fieldValue)
                            .replace('%FieldName%', fieldName || '');
                    }
                },
                defaultOptions: defaultOptions,
                messageTriggers: messageTriggers,
                getPrioritizedErrorType: function (errors) {
                    errors.sort(function (a, b) {
                        return (typePriorities[b] || 0 ) - (typePriorities[a] || 0);
                    });
                    return errors[0];
                }
            }
        };


    })

//todo - remove
    .
    directive('blacklist', function () {
        return {
            require: 'ngModel',
            link: function (scope, elem, attr, ngModel) {
                var blacklist = attr.blacklist.split(',');

                //For DOM -> model validation
                ngModel.$parsers.unshift(function (value) {
                    var valid = blacklist.indexOf(value) === -1;
                    ngModel.$setValidity('blacklist', valid);
                    return valid ? value : undefined;
                });

                //For model -> DOM validation
                ngModel.$formatters.unshift(function (value) {
                    ngModel.$setValidity('blacklist', blacklist.indexOf(value) === -1);
                    return value;
                });
            }
        };
    });

