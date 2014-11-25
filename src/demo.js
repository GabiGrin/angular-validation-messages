/**
 * Created by Gabriel_Grinberg on 11/21/14.
 */
'use strict';
angular.module('demo', ['gg.vmsgs', 'ui.bootstrap', 'hljs', 'ngScrollSpy'])
  .controller('DemoCtrl', function () {

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
      template: '<div></div>',
      link: function (scope, elem, attrs) {
        var edited = false;
        scope.$watch(function () {
          var el = $(scope.selector)[0];
          var isCode = el && el.tagName === 'SCRIPT';
          return el && el[isCode ? 'innerHTML' : 'outerHTML'];
        }, function (code) {
          if (code && !edited) {
            edited = true;
            elem.html($compile('<div hljs>' + code + '</div>')(scope).html());
          }
        });
      }
    }
  })
  .directive('demohtml', function ($templateCache, $timeout) {
    return {
      scope: {
        num: '@'
      },
      restrict: 'EA',
      priority: 10,
      template: '<pre><code></code></pre>',
      link: function (scope, elem) {
        $timeout(function () {
          var rawHtml = $templateCache.get('src/examples/e' + scope.num + '.html');
          elem.find('code').text(rawHtml);
          $('pre code').each(function (i, block) {
            console.log('block', block);
            hljs.highlightBlock(block);
          });
        }, 1000);

      }
    }
  })
  .directive('demojs', function ($http) {
    return {
      scope: {
        num: '@'
      },
      restrict: 'EA',
      priority: 10,
      template: '<pre><code></code></pre>',
      link: function (scope, elem) {
        $http.get('src/examples/e' + scope.num + '.js')
          .success(function (rawJS) {

          elem.find('code').text(rawJS);
          $('pre code').each(function (i, block) {
            console.log('block', block);
            hljs.highlightBlock(block);
          });
        });
      }
    }
  });
