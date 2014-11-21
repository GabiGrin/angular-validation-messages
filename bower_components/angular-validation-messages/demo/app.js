'use strict';

angular
    .module('vmsgsDemo', ['gg.vmsgs'])
    .config(function (ValidationsHelperProvider) {

    });


'use strict';

angular.module('vmsgsDemo')
    .controller('MainCtrl', function ($scope, $timeout, $http) {
        $scope.msgs = [];

        $scope.submitForm = function () {
            console.log('Submitting form!');
            $scope.msgs.push('Submited: ' + (new Date().toString()));
        };

        $scope.submitError = function (e) {
            console.error('error', e);
        };

        $scope.customFormTemplate = '<p class="text-warning"><span class="glyphicon glyphicon-remove"></span> {{errorMessage}}</p>';

        $scope.customControlTemplate = '<p class="text-center"><strong>{{errorMessage}}</strong><br>But, here\'s a funny cat gif to cheer you up!<a href="http://thecatapi.com"><img style="max-height: 200px;max-width:200px" src="http://thecatapi.com/api/images/get?format=src&type=gif"></a></p>';

        $scope.formSuccess = [];
        $scope.submitForm = function (num) {
            $scope.formSuccess[num] = true;
            $timeout(function () {
                $scope.formSuccess[num] = false;
            }, 5000);
        };

    })
//custom directive to showcase
    .directive('customSlider',function(){
       return {
           restrict:'E',
           require:'?ngModel',
           template:'<div style="display:inline-block"><a class="btn btn-info btn-xs pull-lefgt" ng-click="val=val-1;">-</a><strong>  {{val}}  </strong>' +
               '<a class="btn btn-info btn-xs" ng-click="val=val+1">+</a></div>',
           replace:true,
           link:function(scope,elem,attrs,ngModel){
               if (!ngModel) return;

               if (isNaN(scope.val)){
                   scope.val=0;
               }

               scope.$watch('val',function(value){
                   ngModel.$setViewValue(value);
               });

               ngModel.$render=function(val){
                   scope.val=parseInt(ngModel.$viewValue);
               };

               scope.plus=function(){val++};


               //For DOM ->= model validation
               ngModel.$parsers.unshift(function(value) {
                   var valid = (!attrs.min || value>=attrs.min);
                   ngModel.$setValidity('min', valid);
                   console.log('min valid', valid,value,attrs.min);

                   return value;
               });
               ngModel.$parsers.unshift(function(value) {
                   var valid = (!attrs.max || value<=attrs.max);
                   ngModel.$setValidity('max', valid);
                   return value;
               });

               //For model ->= DOM validation
               ngModel.$formatters.unshift(function(value) {
                   var valid = (!attrs.min || value>=attrs.min);
                   console.log('min valid', valid);
                   ngModel.$setValidity('min', valid);
                   return value;
               });
               ngModel.$formatters.unshift(function(value) {
                   var valid = (!attrs.max || value<=attrs.max);
                   ngModel.$setValidity('max', valid);
                   return value;
               });

           }
       }

    });
