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
module Spiro.Angular.Modern {

    app.controller("Pane1HomeController", ($scope: ISpiroScope, handlers: IHandlers, urlManager : IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleHome($scope, routeData.pane1);
    });

    app.controller("Pane2HomeController", ($scope: ISpiroScope, handlers: IHandlers, urlManager: IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleHome($scope, routeData.pane2);
    });

    app.controller("Pane1ObjectController", ($scope: ISpiroScope, handlers: IHandlers, urlManager: IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleObject($scope, routeData.pane1);
    });

    app.controller("Pane2ObjectController", ($scope: ISpiroScope, handlers: IHandlers, urlManager: IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleObject($scope, routeData.pane2);
    });

    app.controller("Pane1QueryController", ($scope: ISpiroScope, handlers: IHandlers, urlManager: IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleQuery($scope, routeData.pane1);
    });

    app.controller("Pane2QueryController", ($scope: ISpiroScope, handlers: IHandlers, urlManager: IUrlManager) => {
        const routeData = urlManager.getRouteData();
        handlers.handleQuery($scope, routeData.pane2);
    });

    app.controller("BackgroundController", ($scope: ISpiroScope, handlers: IHandlers) => {
        handlers.handleBackground($scope);
    });

    app.controller("ErrorController", ($scope: ISpiroScope, handlers: IHandlers) => {
        handlers.handleError($scope);
    });

    app.controller("AppBarController", ($scope: ISpiroScope, handlers: IHandlers) => {
        handlers.handleAppBar($scope);
    });
}