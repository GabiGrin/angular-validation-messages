describe('collapse directive', function () {

    var scope, $compile, $timeout;
    var form, input;

    beforeEach(module('validations'));
    beforeEach(inject(function (_$rootScope_, _$compile_, _$timeout_) {
        scope = _$rootScope_;
        $compile = _$compile_;
        $timeout = _$timeout_;
    }));

    beforeEach(function () {
        form = $compile('<form vt-form name="testForm" novalidate></form>')(scope);
        angular.element(document.body).append(form);
        scope.value = null;
    });

    afterEach(function () {
        form.remove();
    });


    it('should work regularly', function () {
        var input = createInput('text', 'text', '');
        scope.value = 'hello';
        scope.$digest();
        expect(input.val()).toEqual('hello');
    });

    it('should not show validation message when not needed', function () {
        var input = createInput('text', 'text', ''),
            validationParent = getValidationNode(input)[0];
        scope.$digest();
        expect(validationParent).toBeHidden();
        input.triggerHandler('blur');
        scope.$digest();
        expect(validationParent).toBeHidden();
        scope.model = 'some text';
        input.triggerHandler('blur');
        scope.$digest();
        expect(validationParent).toBeHidden();
    });

    it('should show validation message on required and hide on complete', function () {
        var input = createInput('text', 'text', 'required'),
            validationParent = getValidationNode(input)[0];
        scope.$digest();
        // console.log(validationParent);
        expect(validationParent).toBeHidden();
        input.triggerHandler('blur');
        scope.$digest();
        expect(validationParent).toBeVisible();
        input.triggerHandler('focus');
        scope.value = 'some text';
        scope.$digest();
        expect(input.val()).toEqual('some text');
        scope.$digest();
        input.triggerHandler('blur');
        scope.$digest();
        expect(validationParent).toBeHidden();
    });


    it('should show validation message on minimum length and hide on complete', function () {
        var input = createInput('text', 'text', 'ng-minlength="10"'),
            validationParent = getValidationNode(input)[0];
        scope.$digest();
        // console.log(validationParent);
        expect(validationParent).toBeHidden();
        changeValueAndBlur('short', input);
        expect(validationParent).toBeVisible();
        changeValueAndBlur('longer now!!!!', input);
        expect(validationParent).toBeHidden();
    });

    it('should show validation error on invalid e-mail', function () {
        var input = createInput('email', 'text', ''),
            validationParent = getValidationNode(input)[0],
            validEmail = 'gabi.grinberg@gmail.com',
            invalidEmail = 'gabigrinberggmail.com';

        scope.$digest();
        // console.log(validationParent);
        expect(validationParent).toBeHidden();
        for (var i = 0; i < 10; i++) {
            changeValueAndBlur(invalidEmail, input);
            expect(validationParent).toBeVisible();
            changeValueAndBlur(validEmail, input);
            expect(validationParent).toBeHidden();
        }
    });


    it('should show validation error on invalid number', function () {
        var input = createInput('number', 'text', ''),
            validationParent = getValidationNode(input)[0],
            validNumber = 4,
            invalidNumber = 'four';

        scope.$digest();
        // console.log(validationParent);
        expect(validationParent).toBeHidden();
        changeValueAndBlur(invalidNumber, input);
        expect(validationParent).toBeVisible();
        changeValueAndBlur(validNumber, input);
        expect(validationParent).toBeHidden();
    });

    iit('should show a custom message if available',function(){
        var requiredMessage='Gotta fill this one',
            badEmailMessage='Not a valid email!',
            input = createInput('email', 'text', 'required messages="{required:\''+requiredMessage+'\',email:\''+badEmailMessage+'\'}"'),
            validationParent = getValidationNode(input)[0];

        changeValueAndBlur('',input);
        expect(validationParent).toBeVisible();
        expect(validationParent).toHaveText(requiredMessage);
        changeValueAndBlur('myEmail@myHost.com',input);
        expect(validationParent).toBeHidden();
        changeValueAndBlur('myEmailMyHost',input);
        expect(validationParent).toBeVisible();
        expect(validationParent).toHaveText(badEmailMessage);
    });

    function createInput(type, name, extra) {
        return $compile('<input vt ng-model="value" type="' + type + '" name="' + name + '" ' + extra + ' />')(scope, function (elem, scope) {
            form.append(elem);
        });
    }

    function changeValueAndBlur(val, input) {
        scope.value = val;
        scope.$digest();
        input.triggerHandler('blur');
        scope.$digest();
    }


    function getValidationNode(elm) {
        return elm.data('vtValidationNode');
    }
});
