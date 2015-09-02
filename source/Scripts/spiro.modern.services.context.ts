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
        
        getError: () => ErrorRepresentation;
      
        getPreviousUrl: () => string;
        
        getSelectedChoice: (parm: string, search: string) => ChoiceViewModel[];
       
        getQuery: (menuId: string, actionId: string, parms : {id :string, val : string }[]) => angular.IPromise<ListRepresentation>;
        getQueryFromObject: (objectId: string, actionId: string, parms: { id: string, val: string }[]) => angular.IPromise<ListRepresentation>;
        getLastActionFriendlyName : () => string;
      

        prompt(promptRep: PromptRepresentation, id: string, searchTerm: string): ng.IPromise<ChoiceViewModel[]>;
        conditionalChoices(promptRep: PromptRepresentation, id: string, args: IValueMap): ng.IPromise<ChoiceViewModel[]>;
      
        invokeAction(action: ActionMember, dvm?: DialogViewModel);
        updateObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);
        saveObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);

        setError: (object: ErrorRepresentation) => void;
        clearSelectedChoice: (parm: string) => void;
        setSelectedChoice: (parm: string, search: string, cvm: ChoiceViewModel) => void;
    }

    interface IContextInternal extends IContext {
        getDomainObject: (type: string, id: string) => ng.IPromise<DomainObjectRepresentation>;
        getService: (type: string) => ng.IPromise<DomainObjectRepresentation>;

        setObject: (object: DomainObjectRepresentation) => void;
           
        setLastActionFriendlyName: (fn : string) => void;
        setQuery(listRepresentation: ListRepresentation);
        setResult(action: ActionMember, result: ActionResultRepresentation, dvm?: DialogViewModel);
        setInvokeUpdateError(error: any, vms: ValueViewModel[], vm?: MessageViewModel);
        setPreviousUrl: (url: string) => void;
    }

    app.service("context", function ($q: ng.IQService, repLoader: IRepLoader, urlManager, $cacheFactory: ng.ICacheFactoryService) {
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

        // from rh

        const createChoiceViewModels = (id: string, searchTerm: string, p: PromptRepresentation) => {
            const delay = $q.defer<ChoiceViewModel[]>();

            const cvms = _.map(p.choices(), (v, k) => {
                return ChoiceViewModel.create(v, id, k, searchTerm);
            });

            delay.resolve(cvms);
            return delay.promise;
        }

        context.prompt = (promptRep: PromptRepresentation, id: string, searchTerm: string): ng.IPromise<ChoiceViewModel[]> => {
            promptRep.reset();
            promptRep.setSearchTerm(searchTerm);
            const createcvm = <(p: PromptRepresentation) => angular.IPromise<Modern.ChoiceViewModel[]>>(_.partial(createChoiceViewModels, id, searchTerm));
            return repLoader.populate(promptRep, true).then(createcvm);
        };

        context.conditionalChoices = (promptRep: PromptRepresentation, id: string, args: IValueMap): ng.IPromise<ChoiceViewModel[]> => {
            promptRep.reset();
            promptRep.setArguments(args);
            const createcvm = <(p: PromptRepresentation) => angular.IPromise<Modern.ChoiceViewModel[]>>(_.partial(createChoiceViewModels, id, null));
            return repLoader.populate(promptRep, true).then(createcvm);
        };

        context.setResult = (action: ActionMember, result: ActionResultRepresentation, dvm?: DialogViewModel) => {
            if (result.result().isNull() && result.resultType() !== "void") {
                if (dvm) {
                    dvm.message = "no result found";
                }
                return;
            }

            const resultObject = result.result().object(); // transient object

            if (result.resultType() === "object" && resultObject.persistLink()) {
                const domainType = resultObject.extensions().domainType;
                resultObject.set("domainType", domainType);
                resultObject.set("instanceId", "0");
                resultObject.hateoasUrl = `/${domainType}/0`;

                context.setObject(resultObject);
                urlManager.setObject(resultObject);
            }

            // persistent object
            if (result.resultType() === "object" && !resultObject.persistLink()) {

                // set the object here and then update the url. That should reload the page but pick up this object 
                // so we don't hit the server again. 

                context.setObject(resultObject);
                urlManager.setObject(resultObject, true);
            }

            if (result.resultType() === "list") {
                const resultList = result.result().list();
                context.setQuery(resultList);
                context.setLastActionFriendlyName(action.extensions().friendlyName);
                urlManager.setQuery(action, dvm);
            }
        };

        context.setInvokeUpdateError = (error: any, vms: ValueViewModel[], vm?: MessageViewModel) => {
            if (error instanceof ErrorMap) {
                _.each(vms, vmi => {
                    var errorValue = error.valuesMap()[vmi.id];

                    if (errorValue) {
                        vmi.value = errorValue.value.toValueString();
                        vmi.message = errorValue.invalidReason;
                    }
                });
                if (vm) {
                    vm.message = (<ErrorMap>error).invalidReason();
                }
            }
            else if (error instanceof ErrorRepresentation) {
                context.setError(error);
                urlManager.setError();
            }
            else {
                if (vm) {
                    vm.message = error;
                }
            }
        };

        // todo this code is nearly duplicated in context - DRY it
        context.invokeAction = (action: ActionMember, dvm?: DialogViewModel) => {
            const invoke = action.getInvoke();
            let parameters: ParameterViewModel[] = [];

            if (dvm) {
                dvm.clearMessages();
                parameters = dvm.parameters;
                _.each(parameters, (parm) => invoke.setParameter(parm.id, parm.getValue()));
                _.each(parameters, (parm) => parm.setSelectedChoice());
            }

            repLoader.populate(invoke, true).
                then((result: ActionResultRepresentation) => {
                    context.setResult(action, result, dvm);
                }).
                catch((error: any) => {
                    context.setInvokeUpdateError(error, parameters, dvm);
                });
        };

        context.updateObject = ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) => {
            const update = object.getUpdateMap();

            const properties = _.filter(ovm.properties, property => property.isEditable);
            _.each(properties, property => update.setProperty(property.id, property.getValue()));

            repLoader.populate(update, true, new DomainObjectRepresentation()).
                then((updatedObject: DomainObjectRepresentation) => {

                    // This is a kludge because updated object has no self link.
                    const rawLinks = (<any>object).get("links");
                    (<any>updatedObject).set("links", rawLinks);

                    // remove pre-changed object from cache
                    $cacheFactory.get("$http").remove(updatedObject.url());

                    context.setObject(updatedObject);
                    urlManager.setObject(updatedObject);
                }).
                catch((error: any) => {
                    context.setInvokeUpdateError(error, properties, ovm);
                });
        };

        context.saveObject = ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) => {
            const persist = object.getPersistMap();

            const properties = _.filter(ovm.properties, property => property.isEditable);
            _.each(properties, property => persist.setMember(property.id, property.getValue()));

            repLoader.populate(persist, true, new DomainObjectRepresentation()).
                then((updatedObject: DomainObjectRepresentation) => {
                    context.setObject(updatedObject);                
                }).
                catch((error: any) => {
                    context.setInvokeUpdateError(error, properties, ovm);
                });
        };

    });

}