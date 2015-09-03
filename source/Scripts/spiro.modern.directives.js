//Copyright 2014 Stef Cascarini, Dan Haywood, Richard Pawson
//Licensed under the Apache License, Version 2.0(the
//"License"); you may not use this file except in compliance
//with the License.You may obtain a copy of the License at
//    http://www.apache.org/licenses/LICENSE-2.0
//Unless required by applicable law or agreed to in writing,
//software distributed under the License is distributed on an
//"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
//KIND, either express or implied.See the License for the
//specific language governing permissions and limitations
//under the License.
/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
// tested 
var Spiro;
(function (Spiro) {
    var Angular;
    (function (Angular) {
        var Modern;
        (function (Modern) {
            // based on code in AngularJs, Green and Seshadri, O'Reilly
            Angular.app.directive('nogDatepicker', function ($filter) {
                return {
                    // Enforce the angularJS default of restricting the directive to
                    // attributes only
                    restrict: 'A',
                    // Always use along with an ng-model
                    require: '?ngModel',
                    // This method needs to be defined and passed in from the
                    // passed in to the directive from the view controller
                    scope: {
                        select: '&' // Bind the select function we refer to the right scope
                    },
                    link: function (scope, element, attrs, ngModel) {
                        if (!ngModel)
                            return;
                        var optionsObj = {};
                        optionsObj.dateFormat = 'd M yy'; // datepicker format
                        var updateModel = function (dateTxt) {
                            scope.$apply(function () {
                                // Call the internal AngularJS helper to
                                // update the two way binding
                                ngModel.$parsers.push(function (val) { return new Date(val).toISOString(); });
                                ngModel.$setViewValue(dateTxt);
                            });
                        };
                        optionsObj.onSelect = function (dateTxt, picker) {
                            updateModel(dateTxt);
                            if (scope.select) {
                                scope.$apply(function () {
                                    scope.select({ date: dateTxt });
                                });
                            }
                        };
                        ngModel.$render = function () {
                            var formattedDate = $filter('date')(ngModel.$viewValue, 'd MMM yyyy'); // angularjs format
                            // Use the AngularJS internal 'binding-specific' variable
                            element.datepicker('setDate', formattedDate);
                        };
                        element.datepicker(optionsObj);
                    }
                };
            });
            Angular.app.directive('nogAutocomplete', function ($filter, $parse, context) {
                return {
                    // Enforce the angularJS default of restricting the directive to
                    // attributes only
                    restrict: 'A',
                    // Always use along with an ng-model
                    require: '?ngModel',
                    // This method needs to be defined and passed in from the
                    // passed in to the directive from the view controller
                    scope: {
                        select: '&' // Bind the select function we refer to the right scope
                    },
                    link: function (scope, element, attrs, ngModel) {
                        if (!ngModel)
                            return;
                        var optionsObj = {};
                        var parent = scope.$parent;
                        var viewModel = (parent.parameter || parent.property);
                        function render(initialChoice) {
                            var cvm = ngModel.$modelValue || initialChoice;
                            if (cvm) {
                                ngModel.$parsers.push(function (val) { return cvm; });
                                ngModel.$setViewValue(cvm.name);
                                element.val(cvm.name);
                            }
                        }
                        ;
                        ngModel.$render = render;
                        var updateModel = function (cvm) {
                            //context.setSelectedChoice(cvm.id, cvm.search, cvm);
                            scope.$apply(function () {
                                ngModel.$parsers.push(function (val) { return cvm; });
                                ngModel.$setViewValue(cvm.name);
                                element.val(cvm.name);
                            });
                        };
                        optionsObj.source = function (request, response) {
                            var prompts = scope.select({ request: request.term });
                            scope.$apply(function () {
                                prompts.then(function (cvms) {
                                    response(_.map(cvms, function (cvm) {
                                        return { "label": cvm.name, "value": cvm };
                                    }));
                                }, function () {
                                    response([]);
                                });
                            });
                        };
                        optionsObj.select = function (event, ui) {
                            updateModel(ui.item.value);
                            return false;
                        };
                        optionsObj.focus = function (event, ui) {
                            return false;
                        };
                        optionsObj.autoFocus = true;
                        optionsObj.minLength = viewModel.minLength;
                        var clearHandler = function () {
                            var value = $(this).val();
                            if (value.length === 0) {
                                updateModel(Modern.ChoiceViewModel.create(new Spiro.Value(""), ""));
                            }
                        };
                        element.keyup(clearHandler);
                        element.autocomplete(optionsObj);
                        render(viewModel.choice);
                    }
                };
            });
            Angular.app.directive('nogConditionalchoices', function ($filter, $parse, context) {
                return {
                    // Enforce the angularJS default of restricting the directive to
                    // attributes only
                    restrict: 'A',
                    // Always use along with an ng-model
                    require: '?ngModel',
                    // This method needs to be defined and passed in from the
                    // passed in to the directive from the view controller
                    scope: {
                        select: '&' // Bind the select function we refer to the right scope
                    },
                    link: function (scope, element, attrs, ngModel) {
                        if (!ngModel)
                            return;
                        var parent = scope.$parent;
                        var viewModel = (parent.parameter || parent.property);
                        var pArgs = viewModel.arguments;
                        var currentOptions = [];
                        function populateArguments() {
                            var nArgs = {};
                            var dialog = parent.dialog;
                            var object = parent.object;
                            if (dialog) {
                                _.forEach(pArgs, function (v, n) {
                                    var parm = _.find(dialog.parameters, function (p) { return p.id === n; });
                                    var newValue = parm.getValue();
                                    nArgs[n] = newValue;
                                });
                            }
                            // todo had to add object.properties check to get this working again - find out why
                            if (object && object.properties) {
                                _.forEach(pArgs, function (v, n) {
                                    var property = _.find(object.properties, function (p) { return p.argId === n; });
                                    var newValue = property.getValue();
                                    nArgs[n] = newValue;
                                });
                            }
                            return nArgs;
                        }
                        function populateDropdown() {
                            var nArgs = populateArguments();
                            var prompts = scope.select({ args: nArgs });
                            prompts.then(function (cvms) {
                                // if unchanged return 
                                if (cvms.length === currentOptions.length && _.all(cvms, function (c, i) { return c.equals(currentOptions[i]); })) {
                                    return;
                                }
                                element.find("option").remove();
                                var emptyOpt = "<option></option>";
                                element.append(emptyOpt);
                                _.forEach(cvms, function (cvm) {
                                    var opt = $("<option></option>");
                                    opt.val(cvm.value);
                                    opt.text(cvm.name);
                                    element.append(opt);
                                });
                                currentOptions = cvms;
                                if (viewModel.isMultipleChoices && viewModel.multiChoices) {
                                    var vals = _.map(viewModel.multiChoices, function (c) {
                                        return c.value;
                                    });
                                    $(element).val(vals);
                                }
                                else if (viewModel.choice) {
                                    $(element).val(viewModel.choice.value);
                                }
                            }, function () {
                                // error clear everything 
                                element.find("option").remove();
                                viewModel.choice = null;
                                currentOptions = [];
                            });
                        }
                        function optionChanged() {
                            if (viewModel.isMultipleChoices) {
                                var options = $(element).find("option:selected");
                                var kvps = [];
                                options.each(function (n, e) {
                                    kvps.push({ key: $(e).text(), value: $(e).val() });
                                });
                                var cvms = _.map(kvps, function (o) { return Modern.ChoiceViewModel.create(new Spiro.Value(o.value), viewModel.id, o.key); });
                                viewModel.multiChoices = cvms;
                            }
                            else {
                                var option = $(element).find("option:selected");
                                var val = option.val();
                                var key = option.text();
                                var cvm = Modern.ChoiceViewModel.create(new Spiro.Value(val), viewModel.id, key);
                                viewModel.choice = cvm;
                                scope.$apply(function () {
                                    ngModel.$parsers.push(function (val) { return cvm; });
                                    ngModel.$setViewValue(cvm.name);
                                });
                            }
                        }
                        function setListeners() {
                            _.forEach(pArgs, function (v, n) {
                                $("#" + n + " :input").on("change", function (e) { return populateDropdown(); });
                            });
                            $(element).on("change", optionChanged);
                        }
                        ngModel.$render = function () {
                            // initial populate
                            //populateDropdown();
                        }; // do on the next event loop,
                        setTimeout(function () {
                            setListeners();
                            // initial populate
                            populateDropdown();
                        }, 1);
                    }
                };
            });
            Angular.app.directive('nogAttachment', function ($window) {
                return {
                    // Enforce the angularJS default of restricting the directive to
                    // attributes only
                    restrict: 'A',
                    // Always use along with an ng-model
                    require: '?ngModel',
                    link: function (scope, element, attrs, ngModel) {
                        if (!ngModel) {
                            return;
                        }
                        function downloadFile(url, mt, success) {
                            var xhr = new XMLHttpRequest();
                            xhr.open('GET', url, true);
                            xhr.responseType = "blob";
                            xhr.setRequestHeader("Accept", mt);
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState === 4) {
                                    success(xhr.response);
                                }
                            };
                            xhr.send(null);
                        }
                        function displayInline(mt) {
                            if (mt === "image/jpeg" ||
                                mt === "image/gif" ||
                                mt === "application/octet-stream") {
                                return true;
                            }
                            return false;
                        }
                        var clickHandler = function () {
                            var attachment = ngModel.$modelValue;
                            var url = attachment.href;
                            var mt = attachment.mimeType;
                            downloadFile(url, mt, function (resp) {
                                var burl = URL.createObjectURL(resp);
                                $window.location.href = burl;
                            });
                            return false;
                        };
                        ngModel.$render = function () {
                            var attachment = ngModel.$modelValue;
                            var url = attachment.href;
                            var mt = attachment.mimeType;
                            var title = attachment.title;
                            var link = "<a href='" + url + "'><span></span></a>";
                            element.append(link);
                            var anchor = element.find("a");
                            if (displayInline(mt)) {
                                downloadFile(url, mt, function (resp) {
                                    var reader = new FileReader();
                                    reader.onloadend = function () {
                                        anchor.html("<img src='" + reader.result + "' alt='" + title + "' />");
                                    };
                                    reader.readAsDataURL(resp);
                                });
                            }
                            else {
                                anchor.html(title);
                            }
                            anchor.on('click', clickHandler);
                        };
                    }
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.directives.js.map