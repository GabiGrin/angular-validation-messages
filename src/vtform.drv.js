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


