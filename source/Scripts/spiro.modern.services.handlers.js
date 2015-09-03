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
/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="spiro.models.ts" />
var Spiro;
(function (Spiro) {
    var Angular;
    (function (Angular) {
        var Modern;
        (function (Modern) {
            Angular.app.service("handlers", function ($routeParams, $location, $q, $cacheFactory, repLoader, context, viewModelFactory, color, repHandlers, navigation, urlManager) {
                var handlers = this;
                function setVersionError(error) {
                    var errorRep = new Spiro.ErrorRepresentation({ message: error });
                    context.setError(errorRep);
                    urlManager.setError();
                }
                function setError(error) {
                    if (error instanceof Spiro.ErrorRepresentation) {
                        context.setError(error);
                    }
                    if (error instanceof Spiro.ErrorMap) {
                        var em = error;
                        var errorRep = new Spiro.ErrorRepresentation({ message: "unexpected error map " + em.warningMessage });
                        context.setError(errorRep);
                    }
                    urlManager.setError();
                }
                function cacheRecentlyViewed(object) {
                    var cache = $cacheFactory.get("recentlyViewed");
                    if (cache && object) {
                        var key = object.domainType();
                        var subKey = object.selfLink().href();
                        var dict = cache.get(key) || {};
                        dict[subKey] = { value: new Spiro.Value(object.selfLink()), name: object.title() };
                        cache.put(key, dict);
                    }
                }
                handlers.handleBackground = function ($scope) {
                    $scope.backgroundColor = color.toColorFromHref($location.absUrl());
                    navigation.push();
                    // validate version 
                    context.getVersion().then(function (v) {
                        var specVersion = parseFloat(v.specVersion());
                        var domainModel = v.optionalCapabilities().domainModel;
                        if (specVersion < 1.1) {
                            setVersionError("Restful Objects server must support spec version 1.1 or greater for Spiro Modern\r\n (8.2:specVersion)");
                        }
                        if (domainModel !== "simple" && domainModel !== "selectable") {
                            setVersionError("Spiro Modern requires domain metadata representation to be simple or selectable not \"" + domainModel + "\"\r\n (8.2:optionalCapabilities)");
                        }
                    });
                };
                handlers.handleHome = function ($scope, routeData) {
                    context.getMenus().
                        then(function (menus) {
                        $scope.menus = viewModelFactory.menusViewModel(menus);
                        $scope.homeTemplate = Angular.homeTemplate;
                    }).catch(function (error) {
                        setError(error);
                    });
                    if (routeData.menuId) {
                        context.getMenu(routeData.menuId).
                            then(function (menu) {
                            $scope.actionsTemplate = Angular.actionsTemplate;
                            var actions = { actions: _.map(menu.actionMembers(), function (am) { return viewModelFactory.actionViewModel(am); }) };
                            $scope.object = actions;
                            if (routeData.dialogId) {
                                $scope.dialogTemplate = Angular.dialogTemplate;
                                var action = menu.actionMember(routeData.dialogId);
                                $scope.dialog = viewModelFactory.dialogViewModel(action);
                            }
                        }).catch(function (error) {
                            setError(error);
                        });
                    }
                };
                handlers.handleQuery = function ($scope, routeData) {
                    var promise = routeData.objectId ? context.getQueryFromObject(routeData.objectId, routeData.actionId, routeData.parms) :
                        context.getQuery(routeData.menuId, routeData.actionId, routeData.parms);
                    promise.
                        then(function (list) {
                        $scope.queryTemplate = routeData.state === Modern.CollectionViewState.List ? Angular.queryListTemplate : Angular.queryTableTemplate;
                        $scope.collection = viewModelFactory.collectionViewModel(list, routeData.state);
                        $scope.title = context.getLastActionFriendlyName();
                    }).catch(function (error) {
                        setError(error);
                    });
                };
                handlers.handleError = function ($scope) {
                    var error = context.getError();
                    if (error) {
                        var evm = viewModelFactory.errorViewModel(error);
                        $scope.error = evm;
                        $scope.errorTemplate = Angular.errorTemplate;
                    }
                };
                handlers.handleAppBar = function ($scope) {
                    var avm = new Modern.AppBarViewModel();
                    $scope.$on("ajax-change", function (event, count) {
                        if (count > 0) {
                            avm.loading = "Loading...";
                        }
                        else {
                            avm.loading = "";
                        }
                    });
                    $scope.$on("back", function () {
                        navigation.back();
                    });
                    $scope.$on("forward", function () {
                        navigation.forward();
                    });
                    avm.template = Angular.appBarTemplate;
                    avm.footerTemplate = Angular.footerTemplate;
                    avm.goHome = "#/";
                    avm.goBack = function () {
                        navigation.back();
                    };
                    avm.goForward = function () {
                        navigation.forward();
                    };
                    avm.hideEdit = function () { return true; };
                    $scope.$parent.$watch("object", function () {
                        // look for object on root
                        var parentAsAny = $scope.$parent;
                        if (parentAsAny.object) {
                            var ovm = parentAsAny.object;
                            if (ovm instanceof Modern.DomainObjectViewModel) {
                                avm.hideEdit = function () { return !ovm.showEdit() || ($routeParams.edit1 === "true"); };
                                avm.doEdit = function () { return ovm.doEdit(); };
                            }
                        }
                    });
                    $scope.appBar = avm;
                };
                handlers.handleObject = function ($scope, routeData) {
                    var _a = routeData.objectId.split("-"), dt = _a[0], id = _a.slice(1);
                    context.getObject(dt, id).
                        then(function (object) {
                        var isTransient = !!object.persistLink();
                        var handler = isTransient ? context.saveObject : context.updateObject;
                        var saveHandler = _.partial(handler, $scope, object);
                        var ovm = viewModelFactory.domainObjectViewModel(object, routeData.collections, saveHandler);
                        $scope.object = ovm;
                        // also put on root so appbar can see
                        $scope.$parent.object = ovm;
                        if (routeData.edit || isTransient) {
                            $scope.objectTemplate = Angular.objectEditTemplate;
                            $scope.actionsTemplate = Angular.nullTemplate;
                        }
                        else {
                            $scope.objectTemplate = Angular.objectViewTemplate;
                            $scope.actionsTemplate = routeData.menuId ? Angular.actionsTemplate : Angular.nullTemplate;
                        }
                        $scope.collectionsTemplate = Angular.collectionsTemplate;
                        // cache
                        cacheRecentlyViewed(object);
                        if (routeData.dialogId) {
                            $scope.dialogTemplate = Angular.dialogTemplate;
                            var action = object.actionMember(routeData.dialogId);
                            $scope.dialog = viewModelFactory.dialogViewModel(action);
                        }
                    }).catch(function (error) {
                        setError(error);
                    });
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.handlers.js.map