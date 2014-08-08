/**
 * Created by Gabriel_Grinberg on 6/13/14.
 */

(function () {
    'use strict';
    angular.module('gg.vmsgs')
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
                    email: '"%FieldValue%" is not a valid e-mail address. You must enter a valid email!',
                    required: 'Field %FieldName% is required!',
                    number: 'Please insert a valid number',
                    fallback: 'There is a problem with this field. Please try again',
                    min: 'This field must be at least %minimum%',
                    max: 'This field must be at most %maximum%'
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
                    parentErrorClass:'has-error',
                    focusFirstError: true,
                    scrollDistance: 50,
                    scrollSpeed: 'fast',
                    errorClass: 'validation-error',
                    animationClass: '',

                    //this shouldn't be overidden edited unless you know what you are doing
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

            this.setParentErrorClass= function (parentErrorClass) {
                defaultOptions.parentErrorClass=parentErrorClass;
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
                return {
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
                                msg = msg.replace('%minimum%', element.attr('min'));
                                break;

                            case 'max':
                                msg = msg.replace('%maximum%', element.attr('max'));
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
            };


        });
})();
