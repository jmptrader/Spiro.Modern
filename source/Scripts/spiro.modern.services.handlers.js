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
            Angular.app.service("handlers", function ($routeParams, $location, $q, $cacheFactory, repLoader, context, viewModelFactory, urlHelper, color, repHandlers, navigation) {
                var handlers = this;
                function setVersionError(error) {
                    var errorRep = new Spiro.ErrorRepresentation({ message: error });
                    context.setError(errorRep);
                    $location.path(urlHelper.toErrorPath());
                }
                handlers.handleBackground = function ($scope) {
                    $scope.backgroundColor = color.toColorFromHref($location.absUrl());
                    $scope.closeNestedObject = urlHelper.toAppUrl($location.path(), ["property", "collectionItem", "resultObject"]);
                    $scope.closeCollection = urlHelper.toAppUrl($location.path(), ["collection", "resultCollection"]);
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
                function setNestedCollection($scope, listOrCollection) {
                    if ($routeParams.tableMode) {
                        $scope.collection = viewModelFactory.collectionViewModel(listOrCollection, "table", true);
                        $scope.modeCollection = urlHelper.toAppUrl($location.path(), []);
                        $scope.collectionTemplate = Angular.nestedCollectionTableTemplate;
                    }
                    else {
                        $scope.collection = viewModelFactory.collectionViewModel(listOrCollection, "");
                        $scope.modeCollection = urlHelper.toAppUrl($location.path(), []) + "&tableMode=true";
                        $scope.collectionTemplate = Angular.nestedCollectionTemplate;
                    }
                }
                function setError(error) {
                    var errorRep;
                    if (error instanceof Spiro.ErrorRepresentation) {
                        errorRep = error;
                    }
                    else {
                        errorRep = new Spiro.ErrorRepresentation({ message: "an unrecognised error has occurred" });
                    }
                    context.setError(errorRep);
                    $location.path(urlHelper.toErrorPath());
                }
                handlers.handleCollectionResult = function ($scope) {
                    context.getCollection().
                        then(function (list) {
                        setNestedCollection($scope, list);
                    }, function (error) {
                        setError(error);
                    });
                };
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
                handlers.handleCollection = function ($scope) {
                    context.getObject($routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                        cacheRecentlyViewed(object);
                        return repLoader.populate(collectionDetails);
                    }).
                        then(function (details) {
                        setNestedCollection($scope, details);
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleActionDialog = function ($scope) {
                    context.getObject($routeParams.sid || $routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        var action = object.actionMember(urlHelper.action());
                        cacheRecentlyViewed(object);
                        if (action.extensions().hasParams) {
                            $scope.dialog = viewModelFactory.dialogViewModel(action, _.partial(repHandlers.invokeAction, $scope, action));
                            $scope.dialogTemplate = Angular.dialogTemplate;
                        }
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleActionResult = function ($scope) {
                    context.getObject($routeParams.sid || $routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        cacheRecentlyViewed(object);
                        var action = object.actionMember(urlHelper.action());
                        if (action.extensions().hasParams) {
                            var delay = $q.defer();
                            delay.reject();
                            return delay.promise;
                        }
                        var result = action.getInvoke();
                        return repLoader.populate(result, true);
                    }).
                        then(function (result) {
                        repHandlers.setResult(null, result);
                    }, function (error) {
                        if (error) {
                            setError(error);
                        }
                        // otherwise just action with parms 
                    });
                };
                function setNestedObject(object, $scope) {
                    $scope.result = viewModelFactory.domainObjectViewModel(object, {}); // todo rename result
                    $scope.nestedTemplate = Angular.nestedObjectTemplate;
                    context.setNestedObject(object);
                    cacheRecentlyViewed(object);
                }
                handlers.handleProperty = function ($scope) {
                    context.getObject($routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        cacheRecentlyViewed(object);
                        var target = object.propertyMember($routeParams.property).value().link().getTarget();
                        return repLoader.populate(target);
                    }).
                        then(function (object) {
                        //setNestedObject(object, $scope);
                        var newurl = urlHelper.toNewAppUrl2(object.getUrl());
                        $location.path(newurl);
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleCollectionItem = function ($scope) {
                    var collectionItemTypeKey = $routeParams.collectionItem.split("/");
                    var collectionItemType = collectionItemTypeKey[0];
                    var collectionItemKey = collectionItemTypeKey[1];
                    context.getNestedObject(collectionItemType, collectionItemKey).
                        then(function (object) {
                        cacheRecentlyViewed(object);
                        setNestedObject(object, $scope);
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleServices = function ($scope) {
                    context.getServices().
                        then(function (services) {
                        $scope.services = viewModelFactory.servicesViewModel(services);
                        $scope.servicesTemplate = Angular.servicesTemplate;
                        context.setObject(null);
                        context.setNestedObject(null);
                    }, function (error) {
                        setError(error);
                    });
                };
                function getMenus($scope) {
                    context.getMenus().
                        then(function (menus) {
                        $scope.menus = viewModelFactory.menusViewModel(menus);
                        $scope.homeTemplate = Angular.homeTemplate;
                        context.setObject(null);
                        context.setNestedObject(null);
                    }, function (error) {
                        setError(error);
                    });
                }
                ;
                handlers.handleHome = function ($scope, currentMenu, currentDialog) {
                    context.getMenus().
                        then(function (menus) {
                        $scope.menus = viewModelFactory.menusViewModel(menus);
                        $scope.homeTemplate = Angular.homeTemplate;
                        context.setObject(null);
                        context.setNestedObject(null);
                    }, function (error) {
                        setError(error);
                    });
                    if (currentMenu) {
                        context.getMenu(currentMenu).
                            then(function (menu) {
                            $scope.actionsTemplate = Angular.actionsTemplate;
                            var actions = { actions: _.map(menu.actionMembers(), function (am, id) { return viewModelFactory.actionViewModel(am, id, function () { return repHandlers.invokeAction(am); }); }) };
                            $scope.object = actions;
                            if (currentDialog) {
                                $scope.dialogTemplate = Angular.dialogTemplate;
                                var action = menu.actionMember(currentDialog);
                                $scope.dialog = viewModelFactory.dialogViewModel(action, _.partial(repHandlers.invokeAction, action));
                            }
                        }, function (error) {
                            setError(error);
                        });
                    }
                };
                handlers.handleQuery = function ($scope, menuId, objectId, actionId, state, parms) {
                    var promise = objectId ? context.getQueryFromObject(objectId, actionId, parms) :
                        context.getQuery(menuId, actionId, parms);
                    promise.
                        then(function (list) {
                        $scope.queryTemplate = state === "list" ? Angular.queryListTemplate : Angular.queryTableTemplate;
                        $scope.collection = viewModelFactory.collectionViewModel(list, state);
                        $scope.title = context.getLastActionFriendlyName();
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleService = function ($scope) {
                    context.getObject($routeParams.sid).
                        then(function (service) {
                        $scope.object = viewModelFactory.serviceViewModel(service);
                        $scope.serviceTemplate = Angular.serviceTemplate;
                        $scope.actionsTemplate = Angular.actionsTemplate;
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleResult = function ($scope) {
                    var result = $routeParams.resultObject.split("-");
                    var dt = result[0];
                    var id = result[1];
                    context.getNestedObject(dt, id).
                        then(function (object) {
                        cacheRecentlyViewed(object);
                        $scope.result = viewModelFactory.domainObjectViewModel(object, {}); // todo rename result
                        $scope.nestedTemplate = Angular.nestedObjectTemplate;
                        context.setNestedObject(object);
                    }, function (error) {
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
                    $scope.appBar = {};
                    $scope.$on("ajax-change", function (event, count) {
                        if (count > 0) {
                            $scope.appBar.loading = "Loading...";
                        }
                        else {
                            $scope.appBar.loading = "";
                        }
                    });
                    $scope.$on("back", function () {
                        navigation.back();
                    });
                    $scope.$on("forward", function () {
                        navigation.forward();
                    });
                    $scope.appBar.template = Angular.appBarTemplate;
                    $scope.appBar.footerTemplate = Angular.footerTemplate;
                    $scope.appBar.goHome = "#/";
                    $scope.appBar.goBack = function () {
                        navigation.back();
                    };
                    $scope.appBar.goForward = function () {
                        navigation.forward();
                    };
                    $scope.appBar.hideEdit = function () { return true; };
                    $scope.$parent.$watch("object", function () {
                        // look for object on root
                        if ($scope.$parent.object) {
                            var ovm = $scope.$parent.object;
                            $scope.appBar.hideEdit = function () { return !ovm.showEdit() || ($routeParams.edit1 === "true"); };
                            $scope.appBar.doEdit = function () { return ovm.doEdit(); };
                        }
                    });
                };
                handlers.handleObject = function ($scope) {
                    context.getObject($routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        context.setNestedObject(null);
                        $scope.object = viewModelFactory.domainObjectViewModel(object, {});
                        $scope.objectTemplate = Angular.objectTemplate;
                        $scope.actionsTemplate = Angular.actionsTemplate;
                        $scope.propertiesTemplate = Angular.viewPropertiesTemplate;
                        // cache
                        cacheRecentlyViewed(object);
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handlePaneObject = function ($scope, objectId, collections, edit, menuId, dialogId) {
                    var _a = objectId.split("-"), dt = _a[0], id = _a.slice(1);
                    context.getObject(dt, id).
                        then(function (object) {
                        context.setNestedObject(null);
                        var isTransient = !!object.persistLink();
                        var handler = isTransient ? repHandlers.saveObject : repHandlers.updateObject;
                        var saveHandler = _.partial(handler, $scope, object);
                        var ovm = viewModelFactory.domainObjectViewModel(object, collections, saveHandler);
                        $scope.object = ovm;
                        // also put on root so appbar can see
                        $scope.$parent.object = ovm;
                        if (edit || isTransient) {
                            $scope.objectTemplate = Angular.objectEditTemplate;
                            $scope.actionsTemplate = Angular.nullTemplate;
                        }
                        else {
                            $scope.objectTemplate = Angular.objectViewTemplate;
                            $scope.actionsTemplate = menuId ? Angular.actionsTemplate : Angular.nullTemplate;
                        }
                        $scope.collectionsTemplate = Angular.collectionsTemplate;
                        // cache
                        cacheRecentlyViewed(object);
                        if (dialogId) {
                            $scope.dialogTemplate = Angular.dialogTemplate;
                            var action = object.actionMember(dialogId);
                            $scope.dialog = viewModelFactory.dialogViewModel(action, _.partial(repHandlers.invokeAction, action));
                        }
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleTransientObject = function ($scope) {
                    context.getTransientObject().
                        then(function (object) {
                        if (object) {
                            $scope.backgroundColor = color.toColorFromType(object.domainType());
                            context.setNestedObject(null);
                            var obj = viewModelFactory.domainObjectViewModel(object, {}, _.partial(repHandlers.saveObject, $scope, object));
                            //obj.cancelEdit = urlHelper.toAppUrl(context.getPreviousUrl());
                            $scope.object = obj;
                            $scope.objectTemplate = Angular.objectTemplate;
                            $scope.actionTemplate = "";
                            $scope.propertiesTemplate = Angular.editPropertiesTemplate;
                        }
                        else {
                            // transient has disappeared - return to previous page 
                            //parent.history.back();
                            navigation.back();
                        }
                    }, function (error) {
                        setError(error);
                    });
                };
                handlers.handleEditObject = function ($scope) {
                    context.getObject($routeParams.dt, [$routeParams.id]).
                        then(function (object) {
                        context.setNestedObject(null);
                        $scope.object = viewModelFactory.domainObjectViewModel(object, {}, _.partial(repHandlers.updateObject, $scope, object));
                        $scope.objectTemplate = Angular.objectTemplate;
                        $scope.actionTemplate = "";
                        $scope.propertiesTemplate = Angular.editPropertiesTemplate;
                    }, function (error) {
                        setError(error);
                    });
                };
                // helper functions 
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.handlers.js.map