var app=angular.module('validationsold',[]);
app.directive('vld', function ($filter) {

    return {
        restrict: 'A',
        require: ['^form', 'ngModel', '^vldForm'],
        compile: function (elem, attrs) {
            var validationSpan = angular.element('<span class="vld-note text-danger"></span>');
            validationSpan.attr('data-bind-name', attrs.name);
            elem.after(validationSpan);
            elem.data('vldSpan', validationSpan);

            if (!attrs.name) {
                throw new Error("Elements using the vld directive must have a name to work properly!'");
            }

            return function link(scope, elem, attrs, ctrl) {
                var formCtrl = ctrl[0];
                var modelCtrl = ctrl[1];
                var vldCtrl = ctrl[2];

                // console.log('vld ctrl: ',vldCtrl);
                // console.info('Adding elem '+attrs.name+ ' to form: ',ctrl,vldCtrl.getName());
                vldCtrl.addControl({
                    elem: elem,
                    ctrl: modelCtrl
                });

                scope.$watch(function () {
                    return modelCtrl.$invalid;
                }, checkValidation);

                scope.$watch(function () {
                    return modelCtrl.$dirty;
                }, checkValidation);
                scope.$watch(function () {
                    return modelCtrl.$pristine;
                }, checkValidation);

                elem.on('remove', function () {
                    vldCtrl.removeControl(elem);
                });

                function checkValidation() {
                    var isDirty = modelCtrl.$dirty;
                    var isInvalid = modelCtrl.$invalid;
                    var vldSpan = elem.data('vldSpan');

                    if (!vldSpan) {
                        vldSpan = $(elem).next('span.vld-note').first();
                        elem.data('vldSpan', vldSpan);
                    }

                    // console.error('Changed the dirty state to', isDirty);

                    setControlGroupError(isDirty && isInvalid);
                    if (isInvalid && isDirty) {
                        elem.addClass('vld-invalid');
                        var errors = modelCtrl.$error;
                        var errorMsgs = [];
                        angular.forEach(errors, function (isError, type) {
                            if (isError) {
                                var errorCode = errorCodes[type] || 0;
                                var params = [];
//                                console.log("type: ", type);

                                switch (type) {
                                    case 'required':
                                        switch (attrs.type) {
                                            case 'number':
                                                errorCode = errorCodes.invalidNumber;
                                                break;
                                        }
                                        break;
                                    case 'maxlength':
                                        params.push(attrs['ngMaxlength']);
                                        break;
                                    case 'minlength':
                                        params.push(attrs['ngMinlength']);
                                        break;
                                    default:
                                }
//                                console.log('elem,errorcode,type', elem, errorCode, type);
                                var msg = replaceWithParameters($filter('err')(errorCode) || ('Invalid: ' + type), params); //todo filter this
//                                console.log(msg);
                                errorMsgs.push(msg);
                            }
                        });

//                        console.log(vldSpan,validationSpan);
                        if (vldSpan) {
                            vldSpan.text(errorMsgs.join(','));
                        }
                    }
                    else {
                        if (vldSpan) vldSpan.text('');
                        elem.removeClass('vld-invalid');
                    }
                }

                function setControlGroupError(invalid) {
                    var parent = elem.parent();
                    if (parent.hasClass('form-group')) {
                        parent[!invalid ? 'removeClass' : 'addClass']('has-error');
                    }
                }
            }
        }
    }
});


app.directive('vldForm', ['$parse', function ($parse) {

    return {
        restrict: 'A',
        require: 'form',
        scope: {},
        priority: -1, //get it before the ngsubmit
        controller: function ($scope) {
            $scope.controls = controls = [];
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

            //debug
            this.getName = function () {
                return $scope.contName;
            }
        },
        link: function (scope, formElement, attributes, formController) {
            var animateClass = attributes.animationClass || 'flash';

            scope.contName = attributes.name;


            var fn = $parse(attributes.vldOnError);

            if (!attributes.name) {
                throw  new Error('Cannot use vld-form on forms without a name attribute');
            }
            formElement.bind('submit', function (e) {

                    console.log('submitting vld-form', formController);
                    // if form is not valid cancel it.
                    if (isInvalid()) {
                        //console.log('Form is not valid', formController, scope.controls);
                        setChildrenDirty();
                        animateDirty();
                        scrollToFirstElement();

                        scope.$apply(function () {
                            fn(scope, {$event: event});
                        });
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                }
            );

            //check only the monitored scope.controls (by vld)
            function isInvalid() {
                var invalid = false;
                angular.forEach(scope.controls, function (obj) {
                    if (obj.ctrl.$invalid) {
                        invalid = true;
                    }
                });
                return invalid;
            }

            function animateDirty() {
                angular.forEach(scope.controls, function (obj) {
                    var $elem = obj.elem;
                    var $span = $elem.data('vldSpan');
                    if ($elem.is('.ng-invalid') && $span)
                        $span.addClass('animated ' + animateClass)
                            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
                            function () {
                                $span.removeClass('animated ' + animateClass)
                            });
                });
            }

            function setChildrenDirty() {
                angular.forEach(scope.controls, function (obj) {
                    obj.ctrl.$dirty = true;
                });
            }

            function scrollToFirstElement() {
                if (scope.controls[0] && scope.controls[0].elem) {
                    $('html, body').animate({
                        scrollTop: $(scope.controls[0].elem).offset().top - 150
                    }, 400);

                }
            }
        }}
}]);
