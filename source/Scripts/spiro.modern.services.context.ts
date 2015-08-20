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
        getObject: (type: string, id?: string) => ng.IPromise<DomainObjectRepresentation>;
        setObject: (object: DomainObjectRepresentation) => void;
        getNestedObject: (type: string, id: string) => ng.IPromise<DomainObjectRepresentation>;
        setNestedObject: (object: DomainObjectRepresentation) => void;
        getCollection: () => ng.IPromise<ListRepresentation>;
        setCollection: (list: ListRepresentation) => void;
        getError: () => ErrorRepresentation;
        setError: (object: ErrorRepresentation) => void;
        getTransientObject: () => ng.IPromise<DomainObjectRepresentation>;
        setTransientObject: (object: DomainObjectRepresentation) => void;
        getPreviousUrl: () => string;
        setPreviousUrl: (url: string) => void;
        getSelectedChoice: (parm: string, search: string) => ChoiceViewModel[];
        clearSelectedChoice: (parm: string) => void;
        setSelectedChoice: (parm: string, search: string, cvm: ChoiceViewModel) => void;
        getQuery: (menuId: string, actionId: string, parms : {id :string, val : string }[]) => angular.IPromise<ListRepresentation>;

    }

    interface IContextInternal extends IContext {
        getDomainObject: (type: string, id: string) => ng.IPromise<DomainObjectRepresentation>;
        getService: (type: string) => ng.IPromise<DomainObjectRepresentation>;
    }

    app.service("context", function ($q: ng.IQService, repLoader: IRepLoader) {
        const context = <IContextInternal>this;
        var currentHome: HomePageRepresentation = null;

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

        // exposed for test mocking
        context.getDomainObject = (type: string, id: string): ng.IPromise<DomainObjectRepresentation> => {
            var object = new DomainObjectRepresentation();
            object.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;
            return repLoader.populate<DomainObjectRepresentation>(object);
        };

        // exposed for test mocking
        var currentObject: any;

        context.getService = function (serviceType: string): ng.IPromise<DomainObjectRepresentation> {
            var delay = $q.defer<DomainObjectRepresentation>();

            this.getServices().
                then((services: DomainServicesRepresentation) => {
                    var serviceLink = _.find(services.value().models, (model: Link) => { return model.rel().parms[0].value === serviceType; });
                    var service = serviceLink.getTarget();
                    return repLoader.populate(service);
                }).
                then((service: DomainObjectRepresentation) => {
                    currentObject = service;
                    delay.resolve(service);
                }, error => delay.reject(error));
            return delay.promise;
        };

        context.getMenu = function (menuId: string): ng.IPromise<MenuRepresentation> {
            var delay = $q.defer<MenuRepresentation>();

            this.getMenus().
                then((menus: MenusRepresentation) => {
                var menuLink = _.find(menus.value().models, (model: Link) => { return model.rel().parms[0].value ===  menuId; });
                    var menu = menuLink.getTarget();
                    return repLoader.populate(menu);
                }).
                then((menu: MenuRepresentation) => {          
                    delay.resolve(menu);
                }, error => delay.reject(error));
            return delay.promise;
        };



        // tested
        context.getHome = () => {
            var delay = $q.defer<HomePageRepresentation>();

            if (currentHome) {
                delay.resolve(currentHome);
            }
            else {
                repLoader.populate<HomePageRepresentation>(new HomePageRepresentation()).
                    then((home: HomePageRepresentation) => {
                        currentHome = home;
                        delay.resolve(home);
                    }, error => delay.reject(error));
            }

            return delay.promise;
        };

        var currentServices: DomainServicesRepresentation = null;

        // tested
        context.getServices = function () {
            var delay = $q.defer<DomainServicesRepresentation>();

            if (currentServices) {
                delay.resolve(currentServices);
            }
            else {
                this.getHome().
                    then((home: HomePageRepresentation) => {
                        var ds = home.getDomainServices();
                        return repLoader.populate<DomainServicesRepresentation>(ds);
                    }).
                    then((services: DomainServicesRepresentation) => {
                        currentServices = services;
                        delay.resolve(services);
                    }, error => delay.reject(error));
            }

            return delay.promise;
        };

        var currentMenus: MenusRepresentation = null;

        context.getMenus = function () {
            var delay = $q.defer<MenusRepresentation>();

            if (currentMenus) {
                delay.resolve(currentMenus);
            }
            else {
                this.getHome().
                    then((home: HomePageRepresentation) => {
                        var ds = home.getMenus();
                        return repLoader.populate<MenusRepresentation>(ds);
                    }).
                    then((menus: MenusRepresentation) => {
                        currentMenus = menus;
                        delay.resolve(menus);
                    }, error => delay.reject(error));
            }

            return delay.promise;
        };

        var currentVersion: VersionRepresentation = null;

        context.getVersion = function () {
            var delay = $q.defer<VersionRepresentation>();

            if (currentVersion) {
                delay.resolve(currentVersion);
            }
            else {
                this.getHome().
                    then((home: HomePageRepresentation) => {
                        var v = home.getVersion();
                        return repLoader.populate<VersionRepresentation>(v);
                    }).
                    then((version: VersionRepresentation) => {
                        currentVersion = version;
                        delay.resolve(version);
                    }, error => delay.reject(error));
            }

            return delay.promise;
        };
        currentObject = null; // tested
        context.getObject = function (type: string, id?: string) {
            var delay = $q.defer<DomainObjectRepresentation>();

            if (currentObject && isSameObject(currentObject, type, id)) {
                delay.resolve(currentObject);
            }
            else {
                const promise = id ? this.getDomainObject(type, id) : this.getService(type);
                promise.then((object: DomainObjectRepresentation) => {
                    currentObject = object;
                    delay.resolve(object);
                }, error => delay.reject(error));
            }

            return delay.promise;
        };

        var currentCollection = null; // tested

        context.getQuery = function (menuId: string, actionId: string, parms : {id: string, val: string }[]) {
            var delay = $q.defer<ListRepresentation>();

            if (currentCollection /*todo && isSameObject(currentObject, type, id)*/) {
                delay.resolve(currentCollection);
            }
            else {

                this.getMenu(menuId).then((menu: MenuRepresentation) => {
                    const action = menu.actionMember(actionId);               
                    const valueParms = _.map(parms, (p) => { return {id : p.id,  val : new Value(p.val)} });  
                    return repLoader.invoke(action, valueParms);
                }).then((result: ActionResultRepresentation) => {

                    if (result.resultType() === "list") {
                        const resultList = result.result().list();
                        this.setCollection(resultList);
                        delay.resolve(currentCollection);
                    } else {
                        delay.reject("expect list");
                    }
                }, error => delay.reject(error));
            }

            return delay.promise;
        };


        context.setObject = co => currentObject = co;

        var currentNestedObject: DomainObjectRepresentation = null;

        context.getNestedObject = (type: string, id: string) => {
            var delay = $q.defer<DomainObjectRepresentation>();

            if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                delay.resolve(currentNestedObject);
            }
            else {
                const domainObjectRepresentation = new DomainObjectRepresentation();
                domainObjectRepresentation.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;

                repLoader.populate<DomainObjectRepresentation>(domainObjectRepresentation).
                    then((dor: DomainObjectRepresentation) => {
                        currentNestedObject = dor;
                        delay.resolve(dor);
                    }, error => delay.reject(error));
            }

            return delay.promise;
        };

        context.setNestedObject = cno => currentNestedObject = cno;

        var currentError: ErrorRepresentation = null;

        context.getError = () => currentError;

        context.setError = (e: ErrorRepresentation) => currentError = e;
       
        context.getCollection = () => {
            var delay = $q.defer<ListRepresentation>();
            delay.resolve(currentCollection);
            return delay.promise;
        };

        context.setCollection = (c: ListRepresentation) => currentCollection = c;

        var currentTransient: DomainObjectRepresentation = null;

        context.getTransientObject = () => {
            var delay = $q.defer<DomainObjectRepresentation>();
            delay.resolve(currentTransient);
            return delay.promise;
        };

        context.setTransientObject = (t: DomainObjectRepresentation) => currentTransient = t;

        var previousUrl: string = null;

        context.getPreviousUrl = () => previousUrl;

        context.setPreviousUrl = (url: string) => previousUrl = url;

        var selectedChoice: { [parm: string]: { [search: string]: ChoiceViewModel[] } } = {};

        context.getSelectedChoice = (parm: string, search: string) => selectedChoice[parm] ? selectedChoice[parm][search] : [];

        context.setSelectedChoice = (parm: string, search: string, cvm: ChoiceViewModel) => {
            selectedChoice[parm] = selectedChoice[parm] || {};
            selectedChoice[parm][search] = selectedChoice[parm][search] || [];
            selectedChoice[parm][search].push(cvm);
        }

        context.clearSelectedChoice = (parm: string) => selectedChoice[parm] = null;
    });

}