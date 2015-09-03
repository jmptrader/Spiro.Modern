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

    // todo make state enum ?
    // todo improve error handling

    export interface IHandlers {
        handleBackground($scope: ISpiroScope): void;
        handleError($scope: ISpiroScope): void;
        handleAppBar($scope: ISpiroScope): void;
        handleObject($scope: ISpiroScope, routeData: PaneRouteData): void;
        handleHome($scope: ISpiroScope, routeData : PaneRouteData): void;
        handleQuery($scope: ISpiroScope, routeData: PaneRouteData): void;
    }

    app.service("handlers", function($routeParams: ISpiroRouteParams, $location: ng.ILocationService, $q: ng.IQService, $cacheFactory: ng.ICacheFactoryService, repLoader: IRepLoader, context: IContext, viewModelFactory: IViewModelFactory, color: IColor, repHandlers: IRepHandlers, navigation: INavigation, urlManager : IUrlManager) {
        const handlers = <IHandlers>this;

        function setVersionError(error) {
            const errorRep = new ErrorRepresentation({ message: error });
            context.setError(errorRep);
            urlManager.setError();
        }

        function setError(error: ErrorRepresentation);
        function setError(error: ErrorMap);

        function setError(error: any) {
            if (error instanceof ErrorRepresentation) {
                context.setError(error);
            }
            if (error instanceof ErrorMap) {
                let em = <ErrorMap>error;
                const errorRep = new ErrorRepresentation({ message: `unexpected error map ${em.warningMessage}` });
                context.setError(errorRep);
            }
            urlManager.setError();
        }

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

        handlers.handleBackground = ($scope: ISpiroScope) => {
            $scope.backgroundColor = color.toColorFromHref($location.absUrl());

            navigation.push();

            // validate version 

            context.getVersion().then((v: VersionRepresentation) => {
                const specVersion = parseFloat(v.specVersion());
                const domainModel = v.optionalCapabilities().domainModel;

                if (specVersion < 1.1) {
                    setVersionError("Restful Objects server must support spec version 1.1 or greater for Spiro Modern\r\n (8.2:specVersion)");
                }

                if (domainModel !== "simple" && domainModel !== "selectable") {
                    setVersionError(`Spiro Modern requires domain metadata representation to be simple or selectable not "${domainModel}"\r\n (8.2:optionalCapabilities)`);
                }
            });
        };

        handlers.handleHome = ($scope: ISpiroScope, routeData: PaneRouteData) => {

            context.getMenus().
                then((menus: MenusRepresentation) => {
                    $scope.menus = viewModelFactory.menusViewModel(menus);
                    $scope.homeTemplate = homeTemplate;
                }).catch(error => {
                    setError(error);
                });

            if (routeData.menuId) {
                context.getMenu(routeData.menuId).
                    then((menu: MenuRepresentation) => {
                        $scope.actionsTemplate = actionsTemplate;
                        const actions = { actions: _.map(menu.actionMembers(), am => viewModelFactory.actionViewModel(am, () => context.invokeAction(am))) };
                        $scope.object = actions;

                        if (routeData.dialogId) {
                            $scope.dialogTemplate = dialogTemplate;
                            const action = menu.actionMember(routeData.dialogId);
                            $scope.dialog = viewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel) => void > _.partial(context.invokeAction, action));
                        }
                    }).catch(error => {
                        setError(error);
                    });
            }

        };

        handlers.handleQuery = ($scope: ISpiroScope, routeData: PaneRouteData) => {

            var promise = routeData.objectId ? context.getQueryFromObject(routeData.objectId, routeData.actionId, routeData.parms) :
                context.getQuery(routeData.menuId, routeData.actionId, routeData.parms);

            promise.
                then((list: ListRepresentation) => {
                    $scope.queryTemplate = routeData.state === CollectionViewState.List ? queryListTemplate : queryTableTemplate;
                    $scope.collection = viewModelFactory.collectionViewModel(list, routeData.state);
                    $scope.title = context.getLastActionFriendlyName();
                }).catch( error => {
                    setError(error);
                });
        };

        handlers.handleError = ($scope: ISpiroScope) => {
            var error = context.getError();
            if (error) {
                const evm = viewModelFactory.errorViewModel(error);
                $scope.error = evm;
                $scope.errorTemplate = errorTemplate;
            }
        };

        handlers.handleAppBar = ($scope: ISpiroScope) => {

            var avm = new AppBarViewModel();

            $scope.$on("ajax-change", (event, count) => {
                if (count > 0) {
                    avm.loading = "Loading...";
                } else {
                    avm.loading = "";
                }
            });

            $scope.$on("back", () => {
                navigation.back();
            });

            $scope.$on("forward", () => {
                navigation.forward();
            });

            avm.template = appBarTemplate;

            avm.footerTemplate = footerTemplate;

            avm.goHome = "#/";

            avm.goBack = () => {
                navigation.back();
            };

            avm.goForward = () => {
                navigation.forward();
            };

            avm.hideEdit = () => true;

            $scope.$parent.$watch("object", () => {
                // look for object on root
                const parentAsAny = <any>$scope.$parent;
                if (parentAsAny.object) {
                    var ovm = parentAsAny.object;
                    if (ovm instanceof DomainObjectViewModel) {
                        avm.hideEdit = () => !ovm.showEdit() || ($routeParams.edit1 === "true");
                        avm.doEdit = () => ovm.doEdit();
                    }
                }
            });

            $scope.appBar = avm; 
        };

        handlers.handleObject = ($scope: ISpiroScope, routeData: PaneRouteData) => {

            var [dt, ...id] = routeData.objectId.split("-");

            context.getObject(dt, id).
                then((object: DomainObjectRepresentation) => {
                    const isTransient = !!object.persistLink();

                    const handler = isTransient ? context.saveObject : context.updateObject;
                    const saveHandler = <(ovm: DomainObjectViewModel) => void> _.partial(handler, $scope, object);
                    const ovm = viewModelFactory.domainObjectViewModel(object, routeData.collections, saveHandler);

                    $scope.object = ovm;
                    // also put on root so appbar can see
                    (<any>$scope.$parent).object = ovm;

                    if (routeData.edit || isTransient) {
                        $scope.objectTemplate = objectEditTemplate;
                        $scope.actionsTemplate = nullTemplate;
                    } else {
                        $scope.objectTemplate = objectViewTemplate;
                        $scope.actionsTemplate = routeData.menuId ? actionsTemplate : nullTemplate;
                    }

                    $scope.collectionsTemplate = collectionsTemplate;

                    // cache
                    cacheRecentlyViewed(object);

                    if (routeData.dialogId) {
                        $scope.dialogTemplate = dialogTemplate;
                        const action = object.actionMember(routeData.dialogId);
                        $scope.dialog = viewModelFactory.dialogViewModel(action, <(dvm: DialogViewModel) => void > _.partial(context.invokeAction, action));
                    }

                }).catch(error => {
                    setError(error);
                });

        };
    });
}