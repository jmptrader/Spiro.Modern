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
            Angular.app.controller("Pane1HomeController", function ($scope, $routeParams, handlers) {
                // get parm match type and call correct handler.     
                var menuId = $routeParams.menu1;
                var dialogId = $routeParams.dialog1;
                handlers.handleHome($scope, menuId, dialogId);
            });
            Angular.app.controller("Pane2HomeController", function ($scope, $routeParams, handlers) {
                // get parm match type and call correct handler. 
                handlers.handleHome($scope);
            });
            Angular.app.controller("Pane1ObjectController", function ($scope, $routeParams, handlers) {
                // get parm match type and call correct handler. 
                var objectId = $routeParams.object1;
                handlers.handlePaneObject($scope, objectId);
            });
            Angular.app.controller("Pane2ObjectController", function ($scope, $routeParams, handlers) {
                handlers.handlePaneObject($scope, "todo");
            });
            Angular.app.controller("Pane1QueryController", function ($scope, $routeParams, handlers) {
                var menuId = $routeParams.menu1;
                var actionId = $routeParams.action1;
                var parmObjs = _.pick($routeParams, function (v, k) { return k.indexOf("parm1") === 0; });
                var parms = _.map(parmObjs, function (v, k) { return { id: k.substr(k.indexOf("_") + 1), val: v }; });
                handlers.handleQuery($scope, menuId, actionId, parms);
            });
            Angular.app.controller("Pane2QueryController", function ($scope, $routeParams, handlers) {
                var p2 = $routeParams["pane2"];
                var rx = /(.*)-(.*)/;
                var results = rx.exec(p2);
                handlers.handlePaneObject($scope, "todo");
            });
            // tested
            Angular.app.controller("BackgroundController", function ($scope, handlers) {
                handlers.handleBackground($scope);
            });
            // tested
            Angular.app.controller("ServicesController", function ($scope, handlers) {
                handlers.handleServices($scope);
            });
            // tested
            Angular.app.controller("ServiceController", function ($scope, handlers) {
                handlers.handleService($scope);
            });
            // tested
            Angular.app.controller("DialogController", function ($scope, $routeParams, handlers) {
                if ($routeParams.action) {
                    handlers.handleActionDialog($scope);
                }
            });
            // tested
            Angular.app.controller("NestedObjectController", function ($scope, $routeParams, handlers) {
                // action takes priority 
                if ($routeParams.action) {
                    handlers.handleActionResult($scope);
                }
                // action + one of  
                if ($routeParams.property) {
                    handlers.handleProperty($scope);
                }
                else if ($routeParams.collectionItem) {
                    handlers.handleCollectionItem($scope);
                }
                else if ($routeParams.resultObject) {
                    handlers.handleResult($scope);
                }
            });
            // tested
            Angular.app.controller("CollectionController", function ($scope, $routeParams, handlers) {
                if ($routeParams.resultCollection) {
                    handlers.handleCollectionResult($scope);
                }
                else if ($routeParams.collection) {
                    handlers.handleCollection($scope);
                }
            });
            // tested
            Angular.app.controller("ObjectController", function ($scope, $routeParams, handlers) {
                if ($routeParams.editMode) {
                    handlers.handleEditObject($scope);
                }
                else {
                    handlers.handleObject($scope);
                }
            });
            // tested
            Angular.app.controller("TransientObjectController", function ($scope, handlers) {
                handlers.handleTransientObject($scope);
            });
            // tested
            Angular.app.controller("ErrorController", function ($scope, handlers) {
                handlers.handleError($scope);
            });
            // tested
            Angular.app.controller("AppBarController", function ($scope, handlers) {
                handlers.handleAppBar($scope);
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.controllers.js.map