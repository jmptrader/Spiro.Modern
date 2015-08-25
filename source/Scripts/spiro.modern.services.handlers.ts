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

module Spiro.Angular.Modern {


    export interface IHandlers {
        handleBackground($scope): void;
        handleCollectionResult($scope): void;
        handleCollection($scope): void;
        handleActionDialog($scope): void;
        handleActionResult($scope): void;
        handleProperty($scope): void;
        handleCollectionItem($scope): void;
        handleError(error: any): void;
        handleServices($scope): void;
        handleService($scope): void;
        handleResult($scope): void;
        handleEditObject($scope): void;
        handleTransientObject($scope): void;

        // make state enum ?
        handlePaneObject($scope, objectId: string, collections: {[index: string] : string},   menuId? : string, dialogId? : string): void;
        handleAppBar($scope): void;

        handleHome($scope, currentMenu? : string, currentDialog? : string): void;
        handleObject($scope): void;
        // obviously will have to change to generalize
        handleQuery($scope, menuId : string, actionId :string, state : string,  parms : {id : string, val : string}[]): void;
    }

    app.service("handlers", function($routeParams: ISpiroRouteParams, $location: ng.ILocationService, $q: ng.IQService, $cacheFactory: ng.ICacheFactoryService, repLoader: IRepLoader, context: IContext, viewModelFactory: IViewModelFactory, urlHelper: IUrlHelper, color: IColor, repHandlers: IRepHandlers, navigation: INavigation) {
        const handlers = <IHandlers>this;

        function setVersionError(error) {
            const errorRep = new ErrorRepresentation({ message: error });
            context.setError(errorRep);
            $location.path(urlHelper.toErrorPath());
        }

         // tested
        handlers.handleBackground = $scope => {
            $scope.backgroundColor = color.toColorFromHref($location.absUrl());
            $scope.closeNestedObject = urlHelper.toAppUrl($location.path(), ["property", "collectionItem", "resultObject"]);
            $scope.closeCollection = urlHelper.toAppUrl($location.path(), ["collection", "resultCollection"]);
            navigation.push();

            // validate version 

            context.getVersion().then((v: VersionRepresentation) => {
                const specVersion =  parseFloat(v.specVersion());
                const domainModel = v.optionalCapabilities().domainModel;

                if (specVersion < 1.1) {
                    setVersionError("Restful Objects server must support spec version 1.1 or greater for Spiro Modern\r\n (8.2:specVersion)");
                }

                if (domainModel !== "simple" && domainModel !== "selectable") {
                    setVersionError("Spiro Modern requires domain metadata representation to be simple or selectable not \"" + domainModel + "\"\r\n (8.2:optionalCapabilities)");
                }
            });
        };

        // tested
        function setNestedCollection($scope, listOrCollection: IListOrCollection) {


            if ($routeParams.tableMode) {
                $scope.collection = viewModelFactory.collectionViewModel(listOrCollection, "table", true);
                $scope.modeCollection = urlHelper.toAppUrl($location.path(), []);
                $scope.collectionTemplate = nestedCollectionTableTemplate;
            } else {
                $scope.collection = viewModelFactory.collectionViewModel(listOrCollection, "");
                $scope.modeCollection = urlHelper.toAppUrl($location.path(), []) + "&tableMode=true";
                $scope.collectionTemplate = nestedCollectionTemplate;
            }
        }

        function setError(error) {
            let errorRep: ErrorRepresentation;
            if (error instanceof ErrorRepresentation) {
                errorRep = <ErrorRepresentation>error;
            } else {
                errorRep = new ErrorRepresentation({ message: "an unrecognised error has occurred" });
            }
            context.setError(errorRep);
            $location.path(urlHelper.toErrorPath());
        }

        handlers.handleCollectionResult = $scope => {
            context.getCollection().
                then((list: ListRepresentation) => {
                    setNestedCollection($scope, list);
                }, error => {
                    setError(error);
                });
        };

       
        function cacheRecentlyViewed(object: DomainObjectRepresentation) {
            const cache = $cacheFactory.get("recentlyViewed");
           
            if (cache && object) {
                const key = object.domainType();
                const subKey = object.selfLink().href();
                const dict = cache.get(key) || {};
                dict[subKey] = { value: new Value(object.selfLink()), name: object.title() };
                cache.put(key, dict);
            }

        }

         // tested
        handlers.handleCollection = $scope => {
            context.getObject($routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {
                var collectionDetails = object.collectionMember($routeParams.collection).getDetails();
                    cacheRecentlyViewed(object);
                    return repLoader.populate(collectionDetails);
                }).
                then((details: CollectionRepresentation) => {
                    setNestedCollection($scope, details);
                }, error => {
                    setError(error);
                });
        };

        // tested
        handlers.handleActionDialog = $scope => {

            context.getObject($routeParams.sid || $routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {
                    var action = object.actionMember(urlHelper.action());
                    cacheRecentlyViewed(object);

                    if (action.extensions().hasParams) {
                        $scope.dialog = viewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel) => void > _.partial(repHandlers.invokeAction, $scope, action));
                        $scope.dialogTemplate = dialogTemplate;
                    }
                }, error => {
                    setError(error);
                });
        };

        // tested
        handlers.handleActionResult = $scope => {
            context.getObject($routeParams.sid || $routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {
                    cacheRecentlyViewed(object);

                    var action = object.actionMember(urlHelper.action());

                    if (action.extensions().hasParams) {
                        const delay = $q.defer();
                        delay.reject();
                        return delay.promise;
                    }
                    var result = action.getInvoke();
                    return repLoader.populate(result, true);
                }).
                then((result: ActionResultRepresentation) => {
                    repHandlers.setResult(null, result);
                }, error => {
                    if (error) {
                        setError(error);
                    }
                    // otherwise just action with parms 
                });
        };
        
         // tested
        function setNestedObject(object: DomainObjectRepresentation, $scope) {
            $scope.result = viewModelFactory.domainObjectViewModel(object, {}); // todo rename result
            $scope.nestedTemplate = nestedObjectTemplate;
            context.setNestedObject(object);
            cacheRecentlyViewed(object);
        }

        handlers.handleProperty = $scope => {
            context.getObject($routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {
                    cacheRecentlyViewed(object);

                    var target = object.propertyMember($routeParams.property).value().link().getTarget();
                    return repLoader.populate(target);
                }).
                then((object: DomainObjectRepresentation) => {
                    //setNestedObject(object, $scope);

                    var newurl = urlHelper.toNewAppUrl2(object.getUrl());

                    $location.path(newurl);

                }, error => {
                    setError(error);
                });
        };

        //tested
        handlers.handleCollectionItem = $scope => {
            var collectionItemTypeKey = $routeParams.collectionItem.split("/");
            var collectionItemType = collectionItemTypeKey[0];
            var collectionItemKey = collectionItemTypeKey[1];

            context.getNestedObject(collectionItemType, collectionItemKey).
                then((object: DomainObjectRepresentation) => {
                    cacheRecentlyViewed(object);

                    setNestedObject(object, $scope);
                }, error => {
                    setError(error);
                });
        };

        // tested
        handlers.handleServices = $scope => {
            context.getServices().
                then((services: DomainServicesRepresentation) => {
                    $scope.services = viewModelFactory.servicesViewModel(services);
                    $scope.servicesTemplate = servicesTemplate;
                    context.setObject(null);
                    context.setNestedObject(null);
                }, error => {
                    setError(error);
                });
        };

       function getMenus ($scope) {
            context.getMenus().
                then((menus: MenusRepresentation) => {
                    $scope.menus = viewModelFactory.menusViewModel(menus);
                    $scope.homeTemplate = homeTemplate;
                    context.setObject(null);
                    context.setNestedObject(null);
                
                }, error => {
                    setError(error);
                });
        };


        handlers.handleHome = ($scope, currentMenu?: string, currentDialog?: string) => {

            context.getMenus().
                then((menus: MenusRepresentation) => {
                    $scope.menus = viewModelFactory.menusViewModel(menus);
                    $scope.homeTemplate = homeTemplate;
                    context.setObject(null);
                    context.setNestedObject(null);

                }, error => {
                    setError(error);
                });

            if (currentMenu) {

                context.getMenu(currentMenu).
                    then((menu: MenuRepresentation) => {
                        $scope.actionsTemplate = actionsTemplate;
                        const actions = { actions: _.map(menu.actionMembers(), (am, id) => viewModelFactory.actionViewModel(am, id, () => repHandlers.invokeAction( am))) };
                        $scope.object = actions;

                        if (currentDialog) {
                            $scope.dialogTemplate = dialogTemplate;
                            const action = menu.actionMember(currentDialog);
                            $scope.dialog = viewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel) => void > _.partial(repHandlers.invokeAction,  action));
                        }
                    }, error => {
                        setError(error);
                    });
            }

        };

        handlers.handleQuery = ($scope, menuId : string, actionId :string, state : string,  parms : {id : string, val : string}[]) => {

            context.getQuery(menuId, actionId, parms).
                then((list: ListRepresentation) => {
                    $scope.queryTemplate = state === "list" ? queryListTemplate : queryTableTemplate;
                    $scope.collection = viewModelFactory.collectionViewModel(list, state);
                }, error => {
                    setError(error);
                });
        };

        // tested
        handlers.handleService = $scope => {
            context.getObject($routeParams.sid).
                then((service: DomainObjectRepresentation) => {
                    $scope.object = viewModelFactory.serviceViewModel(service);
                    $scope.serviceTemplate = serviceTemplate;
                    $scope.actionsTemplate = actionsTemplate;
                }, error => {
                    setError(error);
                });

        };

        // tested
        handlers.handleResult = $scope => {

            var result = $routeParams.resultObject.split("-");
            var dt = result[0];
            var id = result[1];

            context.getNestedObject(dt, id).
                then((object: DomainObjectRepresentation) => {
                    cacheRecentlyViewed(object);

                    $scope.result = viewModelFactory.domainObjectViewModel(object, {}); // todo rename result
                    $scope.nestedTemplate = nestedObjectTemplate;
                    context.setNestedObject(object);
                }, error => {
                    setError(error);
                });

        };

        // tested
        handlers.handleError = $scope => {
            var error = context.getError();
            if (error) {
                const evm = viewModelFactory.errorViewModel(error);
                $scope.error = evm;
                $scope.errorTemplate = errorTemplate;
            }
        };

        // tested
        handlers.handleAppBar = $scope => {

            $scope.appBar = {};

            $scope.$on("ajax-change", (event, count) => {
                if (count > 0) {
                    $scope.appBar.loading = "Loading...";
                } else {
                    $scope.appBar.loading = "";
                }
            });

            $scope.$on("back", () => {
                navigation.back();
            });

            $scope.$on("forward", () => {
                navigation.forward();
            });

            $scope.appBar.template = appBarTemplate;

            $scope.appBar.footerTemplate = footerTemplate;

            $scope.appBar.goHome = "#/";

            $scope.appBar.goBack = () => {
                navigation.back();
            };

            $scope.appBar.goForward = () => {
                navigation.forward();
            };

            $scope.appBar.hideEdit = true;

            $scope.$parent.$watch("object", () => {
                // look for object on root

                if ($scope.$parent.object) {
                    var ovm = <DomainObjectViewModel> $scope.$parent.object;
                    $scope.appBar.hideEdit = !ovm.showEdit();
                    $scope.appBar.doEdit = () => ovm.doEdit();
                }
            });


        }; 
        
        //tested
        handlers.handleObject = $scope => {

            context.getObject($routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {
                    context.setNestedObject(null);
                    $scope.object = viewModelFactory.domainObjectViewModel(object, {});
                    $scope.objectTemplate = objectTemplate;
                    $scope.actionsTemplate = actionsTemplate;
                    $scope.propertiesTemplate = viewPropertiesTemplate;

                    // cache
                    cacheRecentlyViewed(object);

                }, error => {
                    setError(error);
                });

        };

        handlers.handlePaneObject = ($scope, objectId: string, collections: { [index: string] : string },  menuId? : string, dialogId? : string) => {

            var [dt, ...id] = objectId.split("-");

            //$scope.$parent.object = null;


            context.getObject(dt, id).
                then((object: DomainObjectRepresentation) => {
                context.setNestedObject(null);
                    let ovm = viewModelFactory.domainObjectViewModel(object, collections);

                    $scope.object = ovm;    
                    // also put on root so appbar can see
                    $scope.$parent.object = ovm;

                    $scope.objectTemplate = objectTemplate;
                    $scope.actionsTemplate = menuId ? actionsTemplate : nullTemplate;
                    $scope.propertiesTemplate = viewPropertiesTemplate;
                    $scope.collectionsTemplate = collectionsTemplate;

                    // cache
                    cacheRecentlyViewed(object);

                    if (dialogId) {
                        $scope.dialogTemplate = dialogTemplate;
                        const action = object.actionMember(dialogId);
                        $scope.dialog = viewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel) => void > _.partial(repHandlers.invokeAction, action));
                    }

                }, error => {
                    setError(error);
                });

        };



        // tested
        handlers.handleTransientObject = $scope => {

            context.getTransientObject().
                then((object: DomainObjectRepresentation) => {

                    if (object) {

                        $scope.backgroundColor = color.toColorFromType(object.domainType());

                        context.setNestedObject(null);
                        const obj = viewModelFactory.domainObjectViewModel(object, {}, <(ovm: DomainObjectViewModel) => void> _.partial(repHandlers.saveObject, $scope, object));
                        obj.cancelEdit = urlHelper.toAppUrl(context.getPreviousUrl());

                        $scope.object = obj;
                        $scope.objectTemplate = objectTemplate;
                        $scope.actionTemplate = "";
                        $scope.propertiesTemplate = editPropertiesTemplate;

                    } else {
                        // transient has disappeared - return to previous page 
                        //parent.history.back();
                        navigation.back();
                    }

                }, error => {
                    setError(error);
                });
        };


        // tested
        handlers.handleEditObject = $scope => {

            context.getObject($routeParams.dt, [$routeParams.id]).
                then((object: DomainObjectRepresentation) => {

                    context.setNestedObject(null);
                    $scope.object = viewModelFactory.domainObjectViewModel(object, {}, <(ovm: DomainObjectViewModel) => void> _.partial(repHandlers.updateObject, $scope, object));
                    $scope.objectTemplate = objectTemplate;
                    $scope.actionTemplate = "";
                    $scope.propertiesTemplate = editPropertiesTemplate;

                }, error => {
                    setError(error);
                });
        };

        // helper functions 
    });
}