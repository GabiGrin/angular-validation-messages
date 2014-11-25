'use strict';
angular.module('demo')
  .controller('Example2Controller', function ($scope) {
    $scope.showMessage = false;
    $scope.showSubmitMessage = function () {
      console.log('calling');
      $scope.showMessage = true;
    };
  });
