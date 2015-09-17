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

/// <reference path="../../Scripts/typings/karma-jasmine/karma-jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.modern.services.handlers.ts" />
/// <reference path="helpers.ts" />

describe("handlers Service", () => {

    var $scope;

    beforeEach(() => {
        module("app");        
    });
    
    describe("handleError", () => {

        beforeEach(inject(($rootScope, handlers: Spiro.Angular.Modern.IHandlers, context) => {
            $scope = $rootScope.$new();

            spyOn(context, "getError").and.returnValue(new Spiro.ErrorRepresentation({ message: "", stacktrace: [] }));

            handlers.handleError($scope);
        }));


        it("should set a error data", () => {
            expect($scope.error).toBeDefined();
            expect($scope.errorTemplate).toEqual("Content/partials/error.html");
        });

    });

    describe("handleBackground", () => {

        let navService: Spiro.Angular.Modern.INavigation;     
        let setError: jasmine.Spy;

        beforeEach(inject(($rootScope, handlers, $location,  color, navigation, context) => {
            $scope = $rootScope.$new();
            navService = navigation;

            spyOn(color, "toColorFromHref").and.returnValue("acolor");
            spyOn(navigation, "push");
           
            setError = spyOn(context, "setError");

        }));

        describe("if validation ok", () => {
            const testVersion = new Spiro.VersionRepresentation();
            beforeEach(inject(($rootScope, $location, $routeParams, handlers: Spiro.Angular.Modern.IHandlers, context) => {
                testVersion.attributes = { specVersion: "1.1", optionalCapabilities: { domainModel: "selectable" } };
                spyOnPromise(context, "getVersion", testVersion);

                handlers.handleBackground($scope);
            }));

            it("should set scope variables", () => {
                expect($scope.backgroundColor).toEqual("acolor");
                expect(navService.push).toHaveBeenCalled();
                expect(setError).not.toHaveBeenCalled();
            });
        });

        describe("if validation fails version", () => {
            const testVersion = new Spiro.VersionRepresentation();
            beforeEach(inject(($rootScope, $location, $routeParams, handlers: Spiro.Angular.Modern.IHandlers, context) => {
                testVersion.attributes = { specVersion: "1.0", optionalCapabilities: { domainModel: "selectable" } };
                spyOnPromise(context, "getVersion", testVersion);

                handlers.handleBackground($scope);
            }));

            it("sets error", () => {
                expect(setError).toHaveBeenCalled();
            });
        });

        describe("if validation fails domain model", () => {
            const testVersion = new Spiro.VersionRepresentation();
            beforeEach(inject(($rootScope, $location, $routeParams, handlers: Spiro.Angular.Modern.IHandlers, context: Spiro.Angular.Modern.IContext) => {
                testVersion.attributes = { specVersion: "1.1", optionalCapabilities: { domainModel: "formal" } };
                spyOnPromise(context, "getVersion", testVersion);

                handlers.handleBackground($scope);
            }));

            it("sets error", () => {
                expect(setError).toHaveBeenCalled();
            });
        });
    });

    describe("handleAppBar", () => {


        function expectAppBarData() {
            expect($scope.appBar).toBeDefined();
            expect($scope.appBar.goHome).toEqual("#/");
            expect($scope.appBar.template).toEqual("Content/partials/appbar.html");
            expect($scope.appBar.footerTemplate).toEqual("Content/partials/footer.html");
            expect($scope.appBar.goBack).toBeDefined();
            expect($scope.appBar.goForward).toBeDefined();
        }

        describe("handleAppBar when not viewing an  object", () => {

            beforeEach(inject(($rootScope, handlers: Spiro.Angular.Modern.IHandlers) => {
                $scope = $rootScope.$new();

                handlers.handleAppBar($scope);
            }));

            it("should set appBar data", () => {
                expectAppBarData();
            });

            it("should disable edit button", () => {
                expect($scope.appBar.hideEdit()).toEqual(true);
            });

        });

        describe("handleAppBar when viewing an editable object", () => {

            const testObject = new Spiro.DomainObjectRepresentation();
            const testMember = new Spiro.PropertyMember({}, testObject, "");
            const testVm = new Spiro.Angular.Modern.DomainObjectViewModel();

            beforeEach(inject(($rootScope, $location, $routeParams, handlers: Spiro.Angular.Modern.IHandlers, context: Spiro.Angular.Modern.IContext) => {
                $scope = $rootScope.$new();
                spyOn(testVm, "showEdit").and.returnValue(true);

                $scope.$parent.object = testVm;

                $routeParams.dt = "test";
                $routeParams.id = "1";

                spyOnPromise(context, "getObject", testObject);
                spyOn(testObject, "propertyMembers").and.returnValue([testMember]);

                spyOn($location, "path").and.returnValue("aPath");
                

                handlers.handleAppBar($scope);
            }));

            it("should set appBar data", () => {
                expectAppBarData();
            });

            //it('should enable edit button', () => {
            //    expect($scope.appBar.hideEdit()).toBe(false);
            //});

        });

        describe("handleAppBar when viewing a non editable object", () => {

            const testObject = new Spiro.DomainObjectRepresentation();
            const testMember = new Spiro.PropertyMember({}, testObject, "");


            beforeEach(inject(($rootScope, $location, $routeParams, handlers: Spiro.Angular.Modern.IHandlers, context: Spiro.Angular.Modern.IContext) => {
                $scope = $rootScope.$new();

                $routeParams.dt = "test";
                $routeParams.id = "1";

                spyOnPromise(context, "getObject", testObject);
                spyOn(testObject, "propertyMembers").and.returnValue([testMember]);
                spyOn(testMember, "disabledReason").and.returnValue("disabled");

                spyOn($location, "path").and.returnValue("aPath");

                handlers.handleAppBar($scope);
            }));

            it("should set appBar data", () => {
                expectAppBarData();
            });

            it("should disable edit button", () => {
                expect($scope.appBar.hideEdit()).toBe(true);
            });

        });

    });

});