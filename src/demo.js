/**
 * Created by Gabriel_Grinberg on 11/21/14.
 */
'use strict';
angular.module('demo', ['gg.vmsgs', 'ui.bootstrap', 'hljs'])
  .controller('DemoCtrl', function () {

  })
  .directive('bob', function () {
    return function link() {
    }
  })
  .directive('example', function () {
    return {
      restrict: 'E',
      templateUrl: 'src/examples/template.html',
      scope: {
        num: '@'
      }
    };
  })
  .directive('demo', function ($compile) {
    return {
      scope: {
        selector: '@'
      },
      restrict: 'E',
      priority: 10,
      template: '<div></div>',
      link: function (scope, elem, attrs) {
        scope.$watch(function () {
          var el = $(scope.selector)[0];
          var isCode = el && el.tagName === 'SCRIPT';
          return el && el[isCode ? 'innerHTML' : 'outerHTML'];
        }, function (code) {
          elem.html($compile('<div hljs>' + code + '</div>')(scope).html());
        });
      }
    }
  });
