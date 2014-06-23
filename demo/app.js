'use strict';

angular
    .module('validationsApp', ['validations'])
    .config(function (ValidationsHelperProvider) {

    });


'use strict';

angular.module('validationsApp')
    .controller('MainCtrl', function ($scope, $timeout,$http) {
        $scope.msgs = [];
        $scope.awesomeThings = [
            'HTML5 Boilerplate',
            'AngularJS',
            'Karma'
        ];

        $scope.submitForm = function () {
            console.log('Submitting form!');
            $scope.msgs.push('Submited: ' + (new Date().toString()));
        };

        $scope.submitError = function (e) {
            console.error('error', e);
        };

        $scope.customFormTemplate='<p class="text-warning"><span class="glyphicon glyphicon-remove"></span> {{errorMessage}}</p>';

        $scope.customControlTemplate = '<p class="text-center"><strong>{{errorMessage}}</strong><br>But, here\'s a funny cat gif to cheer you up!<a href="http://thecatapi.com"><img style="max-height: 200px;max-width:200px" src="http://thecatapi.com/api/images/get?format=src&type=gif"></a></p>';

        $scope.formSuccess = [];
        $scope.submitForm = function (num) {
            $scope.formSuccess[num] = true;
            $timeout(function () {
                $scope.formSuccess[num] = false;
            },5000);
        }

        var consumerKey = encodeURIComponent('o85IAAXsGoyfhQYAAEHzwdch4');
        var consumerSecret = encodeURIComponent('DthpHSDZnKk5eCbn0inFrJeJ4axl0Bud9KgbUBeMZKK3VmC8Q2');
        var credentials =btoa(consumerKey + ':' + consumerSecret);

// Twitters OAuth service endpoint
        var twitterOauthEndpoint = $http.get(
            'https://api.twitter.com/oauth2/token?grant_type=app_credentials"');
        //, {headers: {'Authorization': 'Basic ' + credentials, 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}}

    });
