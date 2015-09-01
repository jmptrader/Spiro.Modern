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

    export interface IContext {
        getHome: () => ng.IPromise<HomePageRepresentation>;
        getVersion: () => ng.IPromise<VersionRepresentation>;
        getServices: () => ng.IPromise<DomainServicesRepresentation>;
        getMenus: () => ng.IPromise<MenusRepresentation>;
        getMenu: (menuId: string) => ng.IPromise<MenuRepresentation>;
        getObject: (type: string, id?: string[]) => ng.IPromise<DomainObjectRepresentation>;
        getObjectByOid: (objectId : string) => ng.IPromise<DomainObjectRepresentation>;
        setObject: (object: DomainObjectRepresentation) => void;
        getError: () => ErrorRepresentation;
        setError: (object: ErrorRepresentation) => void;
        getPreviousUrl: () => string;
        setPreviousUrl: (url: string) => void;
        getSelectedChoice: (parm: string, search: string) => ChoiceViewModel[];
        clearSelectedChoice: (parm: string) => void;
        setSelectedChoice: (parm: string, search: string, cvm: ChoiceViewModel) => void;
        getQuery: (menuId: string, actionId: string, parms : {id :string, val : string }[]) => angular.IPromise<ListRepresentation>;
        getQueryFromObject: (objectId: string, actionId: string, parms: { id: string, val: string }[]) => angular.IPromise<ListRepresentation>;
        getLastActionFriendlyName : () => string;
        setLastActionFriendlyName: (fn : string) => void;
        setQuery(listRepresentation: ListRepresentation);
    }

    interface IContextInternal extends IContext {
        getDomainObject: (type: string, id: string) => ng.IPromise<DomainObjectRepresentation>;
        getService: (type: string) => ng.IPromise<DomainObjectRepresentation>;
    }

    app.service("context", function ($q: ng.IQService, repLoader: IRepLoader) {
        const context = <IContextInternal>this;

        // cached values
        let currentHome: HomePageRepresentation = null;
        let currentObject: DomainObjectRepresentation = null;
        let currentMenu: MenuRepresentation = null;
        let currentServices: DomainServicesRepresentation = null;
        let currentMenus: MenusRepresentation = null;
        let currentVersion: VersionRepresentation = null;
        let currentCollection : ListRepresentation = null;
        let lastActionFriendlyName: string = "";

        function getAppPath() {
            if (appPath.charAt(appPath.length - 1) === "/") {
                return appPath.length > 1 ? appPath.substring(0, appPath.length - 2) : "";
            }
            return appPath;
        }

        function isSameObject(object: DomainObjectRepresentation, type: string, id?: string) {
            const sid = object.serviceId();
            return sid ? sid === type : (object.domainType() === type && object.instanceId() === id);
        }

        function isSameQuery(object: DomainObjectRepresentation, type: string, id?: string) {
            const sid = object.serviceId();
            return sid ? sid === type : (object.domainType() === type && object.instanceId() === id);
        }


        // exposed for test mocking
        context.getDomainObject = (type: string, id: string): ng.IPromise<DomainObjectRepresentation> => {
            const object = new DomainObjectRepresentation();
            object.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;

            return repLoader.populate<DomainObjectRepresentation>(object).
                then((service: DomainObjectRepresentation) => {
                    currentObject = service;
                    return $q.when(service);
                });
        };

        context.getService = function (serviceType: string): ng.IPromise<DomainObjectRepresentation> {

            if (currentObject && isSameObject(currentObject, serviceType)) {
                return $q.when(currentObject);
            }

            return this.getServices().
                then((services: DomainServicesRepresentation) => {
                    const serviceLink = _.find(services.value().models, (model: Link) => { return model.rel().parms[0].value === serviceType; });
                    const service = serviceLink.getTarget();
                    return repLoader.populate(service);
                }).
                then((service: DomainObjectRepresentation) => {
                    currentObject = service;
                    return $q.when(service);
                });
        };

        context.getMenu = (menuId: string): ng.IPromise<MenuRepresentation> => {

            // todo fix menu id
            //if (currentMenu && currentMenu.menuId == menuId) {
            //    return $q.when(currentMenu);
            //}

            return context.getMenus().
                then((menus: MenusRepresentation) => {
                    var menuLink = _.find(menus.value().models, (model: Link) => { return model.rel().parms[0].value ===  menuId; });
                    var menu = menuLink.getTarget();
                    return repLoader.populate(menu);
                }).
                then((menu: MenuRepresentation) => {
                    currentMenu = menu;
                    return $q.when(menu);
                });
        };

        context.getHome = () => {

            if (currentHome) {
                return $q.when(currentHome);
            }

            return repLoader.populate<HomePageRepresentation>(new HomePageRepresentation()).
                then((home: HomePageRepresentation) => {
                    currentHome = home;
                    return $q.when(home);
                });
        };

        context.getServices = function () {

            if (currentServices) {
                return $q.when(currentServices);
            }

            return this.getHome().
                then((home: HomePageRepresentation) => {
                    var ds = home.getDomainServices();
                    return repLoader.populate<DomainServicesRepresentation>(ds);
                }).
                then((services: DomainServicesRepresentation) => {
                    currentServices = services;
                    $q.when(services);
                });
        };


        context.getMenus = function() {
            if (currentMenus) {
                return $q.when(currentMenus);
            }

            return this.getHome().
                then((home: HomePageRepresentation) => {
                    var ds = home.getMenus();
                    return repLoader.populate<MenusRepresentation>(ds);
                }).
                then((menus: MenusRepresentation) => {
                    currentMenus = menus;
                    return $q.when(currentMenus);
                });
        };


        context.getVersion = () => {

            if (currentVersion) {
                return $q.when(currentVersion);
            }

            return context.getHome().
                then((home: HomePageRepresentation) => {
                    var v = home.getVersion();
                    return repLoader.populate<VersionRepresentation>(v);
                }).
                then((version: VersionRepresentation) => {
                    currentVersion = version;
                    return $q.when(version);
                });
        };

        context.getObject = (type: string, id?: string[]) => {
            const oid = _.reduce(id, (a, v) => `${a}${a ? "-" : ""}${v}`, "");
            return oid ? this.getDomainObject(type, oid) : this.getService(type);
        };

        context.getObjectByOid = function (objectId: string) {
            const [dt, ...id] = objectId.split("-");
            return this.getObject(dt, id);
        };

        const handleResult = (result: ActionResultRepresentation) => {

            if (result.resultType() === "list") {
                const resultList = result.result().list();
                this.setCollection(resultList);
                return $q.when(currentCollection);
            } else {
                return $q.reject("expect list");
            }
        }

        context.setQuery = (query: ListRepresentation) => {
            currentCollection = query;
        }

        context.getQuery = (menuId: string, actionId: string, parms : {id: string; val: string }[]) => {

            if (currentCollection /*todo && isSameObject(currentObject, type, id)*/) {
                return $q.when (currentCollection);
            }

            return context.getMenu(menuId).
                then((menu: MenuRepresentation) => {
                    const action = menu.actionMember(actionId);               
                    const valueParms = _.map(parms, (p) => { return { id: p.id, val: new Value(p.val) } });
                    lastActionFriendlyName = action.extensions().friendlyName;
                    return repLoader.invoke(action, valueParms);
                }).then(handleResult);
        };

        context.getQueryFromObject = (objectId: string, actionId: string, parms: { id: string; val: string }[]) => {

            if (currentCollection /*todo && isSameObject(currentObject, type, id)*/) {
                return $q.when(currentCollection);
            }
            return context.getObjectByOid(objectId).
                then((object: DomainObjectRepresentation) => {
                    const action = object.actionMember(actionId);
                    const valueParms = _.map(parms, (p) => { return { id: p.id, val: new Value(p.val) } });
                    lastActionFriendlyName = action.extensions().friendlyName;

                    return repLoader.invoke(action, valueParms);
                }).then(handleResult);
            
        };

        context.setObject = co => currentObject = co;

       

        var currentError: ErrorRepresentation = null;

        context.getError = () => currentError;

        context.setError = (e: ErrorRepresentation) => currentError = e;
       

        var previousUrl: string = null;

        context.getPreviousUrl = () => previousUrl;

        context.setPreviousUrl = (url: string) => previousUrl = url;

        var selectedChoice: { [parm: string]: { [search: string]: ChoiceViewModel[] } } = {};

        context.getSelectedChoice = (parm: string, search: string) => selectedChoice[parm] ? selectedChoice[parm][search] : [];

        context.setSelectedChoice = (parm: string, search: string, cvm: ChoiceViewModel) => {
            selectedChoice[parm] = selectedChoice[parm] || {};
            selectedChoice[parm][search] = selectedChoice[parm][search] || [];
            selectedChoice[parm][search].push(cvm);
        };
        context.clearSelectedChoice = (parm: string) => selectedChoice[parm] = null;
        context.getLastActionFriendlyName = () => {
            return lastActionFriendlyName;
        };
        context.setLastActionFriendlyName = (fn : string) => {
            lastActionFriendlyName = fn;
        };
    });

}