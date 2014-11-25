'use strict';
describe('form directive tests', function () {
  var form,
    $compile,
    $scope,
    body,
    service;

  function createElem(template) {
    var elem = $compile(template)($scope);
    body.append(elem);
    return elem;
  }

  beforeEach(function () {
    module('gg.vmsgs');
    form = null;
    inject(function (_$compile_, _$rootScope_, $document, ValidationMessagesHelper) {
      $compile = _$compile_;
      $scope = _$rootScope_;
      body = $document.find('body').empty();
      service = ValidationMessagesHelper;
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

  it('adds novalidate to forms', function () {
    var form = createElem('<form vmsg-form name="form" ng-submit="submit()"></form>');
    expect(form.attr('novalidate')).toBeDefined();
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

  it('should work with various inputs', function () {
    var form = createElem('<form vmsg-form>' +
      '<input ng-model="name" required vmsg/>' +
      '<input ng-model="email" type="email" required vmsg/>' +
      '<input ng-model="url" type="url" vmsg/>' +
      '<input ng-model="age" type="number" required vmsg/>' +
      '</form>');
    var nameInput = angular.element(form.find('input')[0]);
    var emailInput = angular.element(form.find('input')[1]);
    var urlInput = angular.element(form.find('input')[2]);
    var ageInput = angular.element(form.find('input')[3]);

    var nameMessage = nameInput.data('message-element')[0];
    var emailMessage = emailInput.data('message-element')[0];
    var urlMessage = urlInput.data('message-element')[0];
    var ageMessage = ageInput.data('message-element')[0];

    $scope.$digest();
    form.triggerHandler('submit');
    $scope.$digest();

    expect(nameMessage).toBeVisible();
    expect(emailMessage).toBeVisible();
    expect(urlMessage).toBeHidden();
    expect(ageMessage).toBeVisible();

    expect(nameMessage).toHaveText(service._getErrorMessage('required'));
    expect(emailMessage).toHaveText(service._getErrorMessage('required', 'email'));
    expect(ageMessage).toHaveText(service._getErrorMessage('required', 'number'));

    $scope.url = 'not an url';
    $scope.name = 'Bob';
    $scope.email = 'not an email';
    $scope.age = 22;

    $scope.$digest();
    form.triggerHandler('submit');
    $scope.$digest();
    expect(nameMessage).toBeHidden();
    expect(emailMessage).toBeVisible();
    expect(urlMessage).toBeVisible();
    expect(ageMessage).toBeHidden();

    expect(emailMessage).toHaveText(service._getErrorMessage('email'));
    expect(urlMessage).toHaveText(service._getErrorMessage('url'));
  });
});
