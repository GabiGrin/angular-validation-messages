(function () {
  'use strict';
  function Yavd($parse) {
    return {
      restrict: 'A',
      require: 'form',
      priority: -1,
      compile: function () {
        return {
          pre: function preLink(scope, elem, attrs) {

            scope.formOpts = $parse(attrs.yavd || '')(scope);
            scope.$watch(function () {
              return attrs.yavd;
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

  angular.module('gg.yavd')
    .directive('yavd', ['$parse', Yavd]);
})();

