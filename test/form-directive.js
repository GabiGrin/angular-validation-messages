'use strict';
describe('form directive tests', function () {
  var form,
    $compile,
    $scope,
    body;

  function createElem(template) {
    var elem = $compile(template)($scope);
    body.append(elem);
    return elem;
  }

  beforeEach(function () {
    module('gg.vmsgs');
    form = null;
    inject(function (_$compile_, _$rootScope_, $document) {
      $compile = _$compile_;
      $scope = _$rootScope_;
      body = $document.find('body').empty();
    });

  });

  it('should not work in non ng-form elements', function () {
    expect(function () {
      createElem('<div vmsg-form>');
    }).toThrow();

    expect(function () {
      createElem('<p vmsg-form>');
    }).toThrow();
  });

  it('should not let invalid forms submit themselves', function () {
    var form = createElem('<form vmsg-form name="form" ng-submit="submit()"></form>');
    $scope.submit = function () {
      console.log('whoops');
    };
    spyOn($scope, 'submit');

    $scope.form.$setValidity('some-rule', false);
    form.triggerHandler('submit');
    expect($scope.submit).not.toHaveBeenCalled();

    $scope.form.$setValidity('some-rule', true);
    form.triggerHandler('submit');
    expect($scope.submit).toHaveBeenCalled();
  });

  it('should make all children validation errors visible when trying to submit', function () {
    var form = createElem('<form vmsg-form name="form" ng-submit="submit()">' +
      '<input vmsg required ng-model="value1"/>' +
      '<input ng-minlength="4" ng-model="value2"/>' +
      '</form>');
    var input1 = angular.element(form.children()[0]);
    var input2 = angular.element(form.children()[0]);
    var vmsg1 = input1.data('message-element')[0];
    var vmsg2 = input2.data('message-element')[0];
    $scope.value1 = '';
    $scope.value2 = 'abc';

    $scope.$digest();
    expect(vmsg1).toBeHidden();
    expect(vmsg2).toBeHidden();

    form.triggerHandler('submit');
    $scope.$digest();

    expect(vmsg1).toBeVisible();
    expect(vmsg2).toBeVisible();
  });

  it('should support custom error messages from form', function () {
    $scope.opts = {errorMessages: {pattern: 'Must be the secret word!'}};
    var form = createElem('<form vmsg-form="opts">' +
      '<input ng-model="test" pattern="shh" vmsg/>' +
      '</form>');
    var input = form.find('input');
    var messageElement = input.data('message-element');
    $scope.test = 'not the word';
    $scope.$digest();
    input.triggerHandler('blur');
    $scope.$digest();
    expect(messageElement.text()).toBe('Must be the secret word!');
  });
});
