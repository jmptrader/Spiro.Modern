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
            Angular.app.controller("Pane1HomeController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleHome($scope, routeData.pane1);
            });
            Angular.app.controller("Pane2HomeController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleHome($scope, routeData.pane2);
            });
            Angular.app.controller("Pane1ObjectController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleObject($scope, routeData.pane1);
            });
            Angular.app.controller("Pane2ObjectController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleObject($scope, routeData.pane2);
            });
            Angular.app.controller("Pane1QueryController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleQuery($scope, routeData.pane1);
            });
            Angular.app.controller("Pane2QueryController", function ($scope, handlers, urlManager) {
                var routeData = urlManager.getRouteData();
                handlers.handleQuery($scope, routeData.pane2);
            });
            Angular.app.controller("BackgroundController", function ($scope, handlers) {
                handlers.handleBackground($scope);
            });
            Angular.app.controller("ErrorController", function ($scope, handlers) {
                handlers.handleError($scope);
            });
            Angular.app.controller("AppBarController", function ($scope, handlers) {
                handlers.handleAppBar($scope);
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.controllers.js.map