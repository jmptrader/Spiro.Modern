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

describe("Controllers", () => {
	var $scope, ctrl;

	beforeEach(module("app"));
    
    describe("Pane1HomeController", () => {
        let handleHome: jasmine.Spy;
        let getRouteData: jasmine.Spy;
        let testRouteData: Spiro.Angular.Modern.RouteData;

        beforeEach(inject(($rootScope, $controller, handlers, urlManager) => {
            $scope = $rootScope.$new();
            handleHome = spyOn(handlers, "handleHome");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1HomeController", { $scope: $scope, handlers: handlers, urlManager : urlManager });
        }));

        it("should call getRouteData", () => {
            expect(getRouteData).toHaveBeenCalled();
        });

        it("should call the handler", () => {
            expect(handleHome).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });

    describe("Pane1ObjectController", () => {
        let handleObject: jasmine.Spy;
        let getRouteData: jasmine.Spy;
        let testRouteData: Spiro.Angular.Modern.RouteData;

        beforeEach(inject(($rootScope, $controller, handlers, urlManager) => {
            $scope = $rootScope.$new();
            handleObject = spyOn(handlers, "handleObject");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1ObjectController", { $scope: $scope, handlers: handlers, urlManager: urlManager });
        }));

        it("should call getRouteData", () => {
            expect(getRouteData).toHaveBeenCalled();
        });

        it("should call the handler", () => {
            expect(handleObject).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });

    describe("Pane1QueryController", () => {
        let handleQuery: jasmine.Spy;
        let getRouteData: jasmine.Spy;
        let testRouteData: Spiro.Angular.Modern.RouteData;

        beforeEach(inject(($rootScope, $controller, handlers, urlManager) => {
            $scope = $rootScope.$new();
            handleQuery = spyOn(handlers, "handleQuery");
            testRouteData = new Spiro.Angular.Modern.RouteData();
            getRouteData = spyOn(urlManager, "getRouteData");
            getRouteData.and.returnValue(testRouteData);
            ctrl = $controller("Pane1QueryController", { $scope: $scope, handlers: handlers, urlManager: urlManager });
        }));

        it("should call getRouteData", () => {
            expect(getRouteData).toHaveBeenCalled();
        });

        it("should call the handler", () => {
            expect(handleQuery).toHaveBeenCalledWith($scope, testRouteData.pane1);
        });
    });



	describe("BackgroundController", () => {
		var handleBackground;

		beforeEach(inject(($rootScope, $controller, handlers) => {
			$scope = $rootScope.$new();
			handleBackground = spyOn(handlers, "handleBackground");
			ctrl = $controller("BackgroundController", { $scope: $scope, handlers: handlers });
		}));

		it("should call the handler", () => {
			expect(handleBackground).toHaveBeenCalledWith($scope);
		});  
	});

    describe("ErrorController", () => {

        var handleError;

        beforeEach(inject(($rootScope, $controller, handlers) => {
            $scope = $rootScope.$new();
            handleError = spyOn(handlers, "handleError");
            ctrl = $controller("ErrorController", { $scope: $scope, handlers: handlers });
        }));

        it("should call the handler", () => {
            expect(handleError).toHaveBeenCalledWith($scope);
        });

    });

	describe("AppBarController", () => {

		var handleAppBar;

		beforeEach(inject(($rootScope, $controller, handlers) => {
			$scope = $rootScope.$new();
			handleAppBar = spyOn(handlers, "handleAppBar");
			ctrl = $controller("AppBarController", { $scope: $scope, handlers: handlers });
		}));

		it("should call the handler", () => {
			expect(handleAppBar).toHaveBeenCalledWith($scope);
		});

	});

});