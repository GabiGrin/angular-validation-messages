'use strict';
angular.module('demo')
  .controller('Example1Controller', function ($scope) {
    $scope.showMessage = false;
    $scope.showSubmitMessage = function () {
      console.log('calling');
      $scope.showMessage = true;
    };
  });
