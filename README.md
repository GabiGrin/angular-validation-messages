[![Build Status](https://travis-ci.org/GabiGrin/angular-validation-messages.svg?branch=master)](https://travis-ci.org/GabiGrin/angular-validation-messages)
[![Coverage Status](https://coveralls.io/repos/GabiGrin/angular-validation-messages/badge.png?branch=master)](https://coveralls.io/r/GabiGrin/angular-validation-messages?branch=master)
angular-validation-messages
===========================

Add validation messages to your forms in a breeze

##Why?
When writing forms, a you will soon find yourself writing the same code over and over again, just to display what is invalid in the form.
This directive turns this:
```
<form name="myForm" ng-submit="doSomething()">
    <input type="text" name="myName" ng-minlength="3" ng-model="data.myName" required/>
    <div ng-show="myForm.$dirty">
        <span ng-show="myForm.myEmail.$error.required">This field is required</span>
        <span ng-show="myForm.myEmail.$error.minlength">Please enter at least 20 chars</span>
    </div>
    
    <input type="url" name="myUrl" ng-model="data.myUrl" required/>
    <div ng-show="myForm.$dirty">
        <span ng-show="myForm.myUrl.$error.required">Please enter a valid URL</span>
    </div>
    
    <input type="number" name="myAge" ng-model="data.myAge"/>
    <div ng-show="myForm.$dirty">
        <span ng-show="myForm.myAge.$error.required">Please enter a valid number</span>
    </div>
</form>

//inside controller
$scope.doSomething(){
    if (myForm.$valid){
        //then actually do something
    }
}
```

into this:
```
<form name="myForm" ng-submit="doSomething()" vmsgs-form>
    <input type="text" name="myName" ng-minlength="3" ng-model="data.myName" required vmsg/>
    <input type="url" name="myUrl" ng-model="data.myUrl" required vmsg/>
    <input type="number" name="myAge" ng-model="data.myAge" vmsg/>
</form>

//inside controller
$scope.doSomething(){
  //actually do something
}
```

##Installation and usage
Use bower:
```
bower install angular-valiadtion-messages
```
Or just [download](https://github.com/GabiGrin/angular-validation-messages/archive/master.zip) the files
And then add the following files to your html:
```
<link rel="stylesheet" type="text/css" href="bower_components/angular-validation-messages/dist/angular-validation-messages.css">
<script src="bower_components/angular-validation-messages/dist/angular-validation-messages.js"></script>
```
Add `'gg.vmsgs'` to your app's dependencies

Now just add the "vmsg-form" directive to your forms, and "vmsg" to the inputs you wish to show validation messages for.

##Features:
* Just-add-water form validation messages
* Allows custom message templates to be used
* Does not require "name" attribute to be intact
* Submit only valid forms
* Customize error messages 
* Override options either globally, per form or per control
* Supports different show/hide message triggers
* 100% test coverage
* No jQuery used, no other dependencies - 100% AngularJS
* Out of the box bootstrap parent form-group has-error support
