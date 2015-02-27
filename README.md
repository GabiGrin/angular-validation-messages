[![Build Status](https://travis-ci.org/GabiGrin/angular-validation-messages.svg?branch=master)](https://travis-ci.org/GabiGrin/angular-validation-messages)
[![Coverage Status](https://coveralls.io/repos/GabiGrin/angular-validation-messages/badge.png?branch=master)](https://coveralls.io/r/GabiGrin/angular-validation-messages?branch=master)
[![Code Climate](https://codeclimate.com/github/GabiGrin/angular-validation-messages/badges/gpa.svg)](https://codeclimate.com/github/GabiGrin/angular-validation-messages)
angular-validation-messages
===========================

Add validation messages to your forms in a breeze

##Demo
###[Here](http://gabigrin.github.io/angular-validation-messages/)
PS: It doesn't cover everything yet, more to come.

##What it does

This directive adds automatic validation messages to your forms, by just adding it to your form and fields.
It also prevents your form from being submitted unless it's valid.
For example: 
![example image](http://s27.postimg.org/amxtpgwsz/Screen_Shot_2014_11_25_at_10_56_40_PM.png)

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

It comes with a bunch of predefined messages for commonly used validation messages, such as email, number, minlength, url and more. _You can always override them if you think the stock messages suck!_

##What it doesn't do  
It doesn't create custom validation rules, there are plenty of modules for that.  
It doesn't make your forms prettier, use Bootstrap/Foundation/Zimit/Custom css for that.  

##How
Use bower:
```
bower install angular-validation-messages
```
Or just [download](https://github.com/GabiGrin/angular-validation-messages/archive/master.zip) the files and add the following files to your html:
```
<link rel="stylesheet" type="text/css" href="bower_components/angular-validation-messages/dist/angular-validation-messages.css">
<script src="bower_components/angular-validation-messages/dist/angular-validation-messages.js"></script>
```
Add `'gg.vmsgs'` to your app dependencies (`angular.module('yourApp', ['gg.vmsgs']`)

Now just add the "vmsg-form" directive to your forms, and "vmsg" to the inputs you wish to show validation messages for.

##Features
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

##Overriding options
To override global options, use `ValidationMessagesHelper.setOptions(yourOptions)` in a run block.  
vmsg-form and vmsg directive can also receive an options object. When multiple overrides are used, the most specific one "wins".  

###Supported options

Name | Explanation | Accepts | Default  
--- | --- | --- | ---
showTrigger | trigger to show messages | blur/keydown/submit | blur  
hideTrigger | trigger to hide messages | valid/keydown | valid  
messageClassName | class name added to the message dom element | any string | 'validation-message'  
messageTemplate | html to use as the template for the messages. | any valid html, with 1 root, containing a <msg></msg> element (which will receive the message | <span><msg></msg></span>  
hideClassName | class that is added to hide messages | any classname | ng-hide  
parentErrorClassName | adds (or removes) a class name to a field's parent element, if it matches the 'parentContainerClassName' option. Good for using with bootstrap, where you want to add 'has-error' to the parent div.form-group | any string | 'has-error'    
parentSuccessClassName | adds (or removes) a class name to a field's parent element, if it matches the 'parentContainerClassName' option. Good for using with bootstrap, where you want to add 'has-success' to the parent div.form-group.| any string | ''    
parentContainerClassName | only if this class name is present in the parent element, parentErrorClassName and parentSuccessClassName will be applied | any string | 'form-group'  
errorMessages | allows you to override error messages for specific errors. The error messages passed will be combined with the default ones (using angular.extend) | any valid object | please check src/helper.js:36  


##Caveats
*The vmsg-form directive will add the "novalidate" attribute automatically, so the browser doesn't catch the validation issues by itself.
*It doesn't support hiding the messages when the form is pristine at the moment. Will be added in the near future.
*When overriding the message html template, you must have only one root element, and include the <msg></msg> where you want the message displayed. There is no validation for this yet, so be aware.

##Contributing
PR are more than welcome!
Please make sure you do not brake the build, and add tests for any new features added, maintaining 100% coverage (TDD is highly recommended).
To start hacking just clone the repository and run npm install + bower install, then run 'grunt serve'.

