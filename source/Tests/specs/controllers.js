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
/// <reference path="../../Scripts/spiro.config.ts" />
/// <reference path="../../Scripts/spiro.models.helpers.ts" />
/// <reference path="../../Scripts/spiro.models.ts" />
/// <reference path="../../Scripts/spiro.modern.app.ts" />
/// <reference path="../../Scripts/spiro.modern.controllers.ts" />
/// <reference path="../../Scripts/spiro.modern.directives.ts" />
/// <reference path="../../Scripts/spiro.modern.routedata.ts" />
/// <reference path="../../Scripts/spiro.modern.services.context.ts" />
/// <reference path="../../Scripts/spiro.modern.services.handlers.ts" />
/// <reference path="../../Scripts/spiro.modern.services.navigation.browser.ts" />
/// <reference path="../../Scripts/spiro.modern.services.navigation.simple.ts" />
/// <reference path="../../Scripts/spiro.modern.services.representationhandlers.ts" />
/// <reference path="../../Scripts/spiro.modern.services.urlmanager.ts" />
/// <reference path="../../Scripts/spiro.modern.services.viewmodelfactory.ts" />
/// <reference path="../../Scripts/spiro.modern.viewmodels.ts" />
describe("Controllers", function () {
    var $scope, ctrl;
    beforeEach(module("app"));
    describe("Pane1HomeController", function () {
        var handleHome;
        var getRouteData;
        var testRouteData;
        beforeEach(inject(function ($rootScope, $controller, handlers, urlManager) {
            $scope = $rootScope.$new();
            handleHome = spyOn(handlers, "handleHome");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1HomeController", { $scope: $scope, handlers: handlers, urlManager: urlManager });
        }));
        it("should call getRouteData", function () {
            expect(getRouteData).toHaveBeenCalled();
        });
        it("should call the handler", function () {
            expect(handleHome).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });
    describe("Pane1ObjectController", function () {
        var handleObject;
        var getRouteData;
        var testRouteData;
        beforeEach(inject(function ($rootScope, $controller, handlers, urlManager) {
            $scope = $rootScope.$new();
            handleObject = spyOn(handlers, "handleObject");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1ObjectController", { $scope: $scope, handlers: handlers, urlManager: urlManager });
        }));
        it("should call getRouteData", function () {
            expect(getRouteData).toHaveBeenCalled();
        });
        it("should call the handler", function () {
            expect(handleObject).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });
    describe("Pane1QueryController", function () {
        var handleQuery;
        var getRouteData;
        var testRouteData;
        beforeEach(inject(function ($rootScope, $controller, handlers, urlManager) {
            $scope = $rootScope.$new();
            handleQuery = spyOn(handlers, "handleQuery");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1QueryController", { $scope: $scope, handlers: handlers, urlManager: urlManager });
        }));
        it("should call getRouteData", function () {
            expect(getRouteData).toHaveBeenCalled();
        });
        it("should call the handler", function () {
            expect(handleQuery).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });
    describe("BackgroundController", function () {
        var handleBackground;
        beforeEach(inject(function ($rootScope, $controller, handlers) {
            $scope = $rootScope.$new();
            handleBackground = spyOn(handlers, "handleBackground");
            ctrl = $controller("BackgroundController", { $scope: $scope, handlers: handlers });
        }));
        it("should call the handler", function () {
            expect(handleBackground).toHaveBeenCalledWith($scope);
        });
    });
    describe("ErrorController", function () {
        var handleError;
        beforeEach(inject(function ($rootScope, $controller, handlers) {
            $scope = $rootScope.$new();
            handleError = spyOn(handlers, "handleError");
            ctrl = $controller("ErrorController", { $scope: $scope, handlers: handlers });
        }));
        it("should call the handler", function () {
            expect(handleError).toHaveBeenCalledWith($scope);
        });
    });
    describe("AppBarController", function () {
        var handleAppBar;
        beforeEach(inject(function ($rootScope, $controller, handlers) {
            $scope = $rootScope.$new();
            handleAppBar = spyOn(handlers, "handleAppBar");
            ctrl = $controller("AppBarController", { $scope: $scope, handlers: handlers });
        }));
        it("should call the handler", function () {
            expect(handleAppBar).toHaveBeenCalledWith($scope);
        });
    });
});
//# sourceMappingURL=controllers.js.map