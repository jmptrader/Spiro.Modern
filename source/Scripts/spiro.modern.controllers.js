//Copyright 2014 Stef Cascarini, Richard Pawson
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
var Spiro;
(function (Spiro) {
    (function (Angular) {
        /// <reference path="typings/angularjs/angular.d.ts" />
        /// <reference path="spiro.models.ts" />
        // tested
        (function (Modern) {
            // tested
            Angular.app.controller('BackgroundController', function ($scope, handlers) {
                handlers.handleBackground($scope);
            });

            // tested
            Angular.app.controller('ServicesController', function ($scope, handlers) {
                handlers.handleServices($scope);
            });

            // tested
            Angular.app.controller('ServiceController', function ($scope, handlers) {
                handlers.handleService($scope);
            });

            // tested
            Angular.app.controller('DialogController', function ($scope, $routeParams, handlers) {
                if ($routeParams.action) {
                    handlers.handleActionDialog($scope);
                }
            });

            // tested
            Angular.app.controller('NestedObjectController', function ($scope, $routeParams, handlers) {
                // action takes priority
                if ($routeParams.action) {
                    handlers.handleActionResult($scope);
                }

                // action + one of
                if ($routeParams.property) {
                    handlers.handleProperty($scope);
                } else if ($routeParams.collectionItem) {
                    handlers.handleCollectionItem($scope);
                } else if ($routeParams.resultObject) {
                    handlers.handleResult($scope);
                }
            });

            // tested
            Angular.app.controller('CollectionController', function ($scope, $routeParams, handlers) {
                if ($routeParams.resultCollection) {
                    handlers.handleCollectionResult($scope);
                } else if ($routeParams.collection) {
                    handlers.handleCollection($scope);
                }
            });

            // tested
            Angular.app.controller('ObjectController', function ($scope, $routeParams, handlers) {
                if ($routeParams.editMode) {
                    handlers.handleEditObject($scope);
                } else {
                    handlers.handleObject($scope);
                }
            });

            // tested
            Angular.app.controller('TransientObjectController', function ($scope, handlers) {
                handlers.handleTransientObject($scope);
            });

            // tested
            Angular.app.controller('ErrorController', function ($scope, handlers) {
                handlers.handleError($scope);
            });

            // tested
            Angular.app.controller('AppBarController', function ($scope, handlers) {
                handlers.handleAppBar($scope);
            });
        })(Angular.Modern || (Angular.Modern = {}));
        var Modern = Angular.Modern;
    })(Spiro.Angular || (Spiro.Angular = {}));
    var Angular = Spiro.Angular;
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.controllers.js.map
