(function () {
  'use strict';
  function ValidationMessagesForm($parse) {
    return {
      restrict: 'A',
      require: 'form',
      priority: -1,
      compile: function () {
        return {
          pre: function preLink(scope, elem, attrs) {

            scope.formOpts = $parse(attrs.vmsgForm || '')(scope);
            scope.$watch(function () {
              return attrs.vmsgForm;
            }, function (opts){
              scope.formOpts = $parse(opts || '')(scope);
            });
          },
          post: function postLink(scope, elem, attrs, formCtrl) {
            elem.bind('submit', function (e) {
              if (formCtrl.$invalid) {
                e.stopImmediatePropagation();
                scope.$broadcast('submit');
              }
            });
          }
        };
      },
      controller: function ($scope) {
        this.getOptions = function () {
          return $scope.formOpts;
        };
      }
    };
  }

  angular.module('gg.vmsgs')
    .directive('vmsgForm', ['$parse', ValidationMessagesForm]);
})();

