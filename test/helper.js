/**
 * Created by Gabriel_Grinberg on 11/14/14.
 */
'use strict';
describe('helper', function () {
  var helper;

  beforeEach(function () {
    module('gg.vmsgs');
    inject(function (ValidationMessagesHelper) {
      helper = ValidationMessagesHelper;
    });
  });

  it('should have a helper service', function () {
    expect(helper).toBeDefined();
  });

  it('can change default options', function () {
    var original = helper.getOptions();
    helper.setOptions();
    expect(helper.getOptions()).toEqual(original);

    helper.setOptions({showTrigger: 'submit'});
    expect(helper.getOptions()).toEqual(angular.extend({}, original, {showTrigger: 'submit'}));
  });

  it('should be able to render errors', function () {
    expect(helper.renderError('test')).toBe('test');
    expect(helper.renderError('test {0} with {1}', {0: 'one', 1: 'parameters'})).toBe('test one with parameters');
    expect(helper.renderError('Number must be between {min} and {max}', {min: 5, max: 10})).toBe('Number must be between 5 and 10');
    expect(helper.renderError('Hello {world}', {notWorld: 'world'})).toBe('Hello {world}');
  });

  it('should have error messages for all known validators', function () {
    helper.errorKeys.forEach(function (errorKey) {
      expect(helper.errorMessages[errorKey]).toBeTruthy();
    });
  });

  it('should extract render parameters from input', function () {
    var elem1 = angular.element('<input min="2" max="4" minlength="10" maxlength="50" pattern="pat"/>');
    expect(helper.getRenderParameters(elem1)).toEqual(
      {
        min: '2',
        max: '4',
        minlength: '10',
        maxlength: '50',
        pattern: 'pat'
      });
  });

  it('should extract render parameters from input even when using ng-[attr]', function () {
    var elem1 = angular.element('<input min="2" max="4" ng-minlength="10" ng-maxlength="50" ng-pattern="/pat/"/>');
    expect(helper.getRenderParameters(elem1)).toEqual(
      {
        min: '2',
        max: '4',
        minlength: '10',
        maxlength: '50',
        pattern: '/pat/'
      });
  });

  it('should fall back to default when type is not provided when getting error message', function () {
    expect(helper._getErrorMessage('required', 'bogus')).toBe(helper._getErrorMessage('required', 'default'));
    expect(helper._getErrorMessage('maxlength', 'bogus2')).toBe(helper._getErrorMessage('maxlength', 'default'));
  });

  it('should throw error when trying to get bad error messages', function () {
    expect(function () {
      helper._getErrorMessage('pumpkin');
    }).toThrow();

    expect(function () {
      helper._getErrorMessage('spongebob');
    }).toThrow();
  });

  it('should get error messages based on error object and element', function () {
    var input1 = angular.element('<input type="text" minlength="20"/>');
    var input2 = angular.element('<input type="number" min="5" max="10"/>');
    var $error1 = {required: true};
    var $error2 = {minlength: true};

    expect(helper.getErrorMessage($error1, input1)).toBe(helper._getErrorMessage('required'));
    expect(helper.getErrorMessage($error2, input1)).toBe(helper._getErrorMessage('minlength', null, {minlength: 20}));
    expect(helper.getErrorMessage($error1, input2)).toBe(helper._getErrorMessage('required', 'number'));
  });

  it('should prioritize error messages, and show the most important one only', function () {
    var input1 = angular.element('<input type="text" minlength="20" pattern="test"/>');
    var $error1 = {required: true, pattern: true, minlength: true};
    var $error2 = {pattern: true, minlength: true};
    var $error3 = {pattern: true, someother: true};

    expect(helper.getErrorMessage($error1, input1)).toBe(helper._getErrorMessage('required'));
    expect(helper.getErrorMessage($error2, input1)).toBe(helper._getErrorMessage('minlength', 'text', {minlength: 20}));
    expect(helper.getErrorMessage($error3, input1)).toBe(helper._getErrorMessage('pattern', 'text', {pattern: 'test'}));
  });

  it('should use custom error messages if available', function () {
    var input1 = angular.element('<input type="text" minlength="20" pattern="test"/>');
    var input2 = angular.element('<input type="number" minlength="2" pattern="[0-4]*"/>');
    var $error1 = {required: true};
    var $error2 = {minlength: true};
    var $error3 = {pattern: true};

    var opts = {
      errorMessages: {
        required: {
          default: 'Custom msg #1',
          number: 'Number here!'
        },
        minlength: 'Custom msg #2',
        pattern: {
          text: 'Text must match pattern',
          number: 'Numbers must be only 0-4'
        }
      }
    };

    var opts2 = {
      errorMessages: {
        required: 'Required'
      }
    };

    //should use the new custom message, because text goes to default
    expect(helper.getErrorMessage($error1, input1, opts)).toBe('Custom msg #1');
    expect(helper.getErrorMessage($error1, input1, opts2)).toBe('Required');
    expect(helper.getErrorMessage($error1, input2, opts)).toBe('Number here!');

    expect(helper.getErrorMessage($error2, input1, opts)).toBe('Custom msg #2');
    expect(helper.getErrorMessage($error3, input1, opts)).toBe('Text must match pattern');
    expect(helper.getErrorMessage($error3, input2, opts)).toBe('Numbers must be only 0-4');
  });

})
;

describe('helper', function () {
  var helper;
  var $scope;

  beforeEach(function () {
    module('gg.vmsgs');
    inject(function (ValidationMessagesHelper, $rootScope) {
      helper = ValidationMessagesHelper;
      $scope = $rootScope.$new();
    });
  });

  it('should be able to create empty message element', function () {
    var opts = helper.getOptions();
    var messageElement = helper.createMessageElement($scope, opts);
    $scope.$digest();
    expect(opts.messageClassName).toBeTruthy();
    expect(messageElement.attr('class')).toContain(opts.messageClassName);
    expect(messageElement.text()).toBe('');
  });

  it('should add custom error key if not yet present', function () {
    var input1 = angular.element('<input type="text"/>');
    var $error1 = {someNewErrorKey: true};

    expect(helper.errorKeys.length).toBe(8);

    var opts = {
      errorMessages: {
        required: {
          default: 'Custom msg #1',
          number: 'Number here!'
        },
        someNewErrorKey: 'Some new error key message'
      }
    };

    helper.setOptions(opts);
    expect(helper.errorKeys.length).toBe(9);

    expect(helper.getErrorMessage($error1, input1, opts)).toBe('Some new error key message');
  });

});

