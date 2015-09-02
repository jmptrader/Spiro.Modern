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
            Angular.app.service("context", function ($q, repLoader, urlManager, $cacheFactory) {
                var _this = this;
                var context = this;
                // cached values
                var currentHome = null;
                var currentObject = null;
                var currentMenu = null;
                var currentServices = null;
                var currentMenus = null;
                var currentVersion = null;
                var currentCollection = null;
                var lastActionFriendlyName = "";
                function getAppPath() {
                    if (Spiro.appPath.charAt(Spiro.appPath.length - 1) === "/") {
                        return Spiro.appPath.length > 1 ? Spiro.appPath.substring(0, Spiro.appPath.length - 2) : "";
                    }
                    return Spiro.appPath;
                }
                function isSameObject(object, type, id) {
                    var sid = object.serviceId();
                    return sid ? sid === type : (object.domainType() === type && object.instanceId() === id);
                }
                function isSameQuery(object, type, id) {
                    var sid = object.serviceId();
                    return sid ? sid === type : (object.domainType() === type && object.instanceId() === id);
                }
                // exposed for test mocking
                context.getDomainObject = function (type, id) {
                    var object = new Spiro.DomainObjectRepresentation();
                    object.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;
                    return repLoader.populate(object).
                        then(function (service) {
                        currentObject = service;
                        return $q.when(service);
                    });
                };
                context.getService = function (serviceType) {
                    if (currentObject && isSameObject(currentObject, serviceType)) {
                        return $q.when(currentObject);
                    }
                    return this.getServices().
                        then(function (services) {
                        var serviceLink = _.find(services.value().models, function (model) { return model.rel().parms[0].value === serviceType; });
                        var service = serviceLink.getTarget();
                        return repLoader.populate(service);
                    }).
                        then(function (service) {
                        currentObject = service;
                        return $q.when(service);
                    });
                };
                context.getMenu = function (menuId) {
                    // todo fix menu id
                    //if (currentMenu && currentMenu.menuId == menuId) {
                    //    return $q.when(currentMenu);
                    //}
                    return context.getMenus().
                        then(function (menus) {
                        var menuLink = _.find(menus.value().models, function (model) { return model.rel().parms[0].value === menuId; });
                        var menu = menuLink.getTarget();
                        return repLoader.populate(menu);
                    }).
                        then(function (menu) {
                        currentMenu = menu;
                        return $q.when(menu);
                    });
                };
                context.getHome = function () {
                    if (currentHome) {
                        return $q.when(currentHome);
                    }
                    return repLoader.populate(new Spiro.HomePageRepresentation()).
                        then(function (home) {
                        currentHome = home;
                        return $q.when(home);
                    });
                };
                context.getServices = function () {
                    if (currentServices) {
                        return $q.when(currentServices);
                    }
                    return this.getHome().
                        then(function (home) {
                        var ds = home.getDomainServices();
                        return repLoader.populate(ds);
                    }).
                        then(function (services) {
                        currentServices = services;
                        $q.when(services);
                    });
                };
                context.getMenus = function () {
                    if (currentMenus) {
                        return $q.when(currentMenus);
                    }
                    return this.getHome().
                        then(function (home) {
                        var ds = home.getMenus();
                        return repLoader.populate(ds);
                    }).
                        then(function (menus) {
                        currentMenus = menus;
                        return $q.when(currentMenus);
                    });
                };
                context.getVersion = function () {
                    if (currentVersion) {
                        return $q.when(currentVersion);
                    }
                    return context.getHome().
                        then(function (home) {
                        var v = home.getVersion();
                        return repLoader.populate(v);
                    }).
                        then(function (version) {
                        currentVersion = version;
                        return $q.when(version);
                    });
                };
                context.getObject = function (type, id) {
                    var oid = _.reduce(id, function (a, v) { return ("" + a + (a ? "-" : "") + v); }, "");
                    return oid ? _this.getDomainObject(type, oid) : _this.getService(type);
                };
                context.getObjectByOid = function (objectId) {
                    var _a = objectId.split("-"), dt = _a[0], id = _a.slice(1);
                    return this.getObject(dt, id);
                };
                var handleResult = function (result) {
                    if (result.resultType() === "list") {
                        var resultList = result.result().list();
                        _this.setCollection(resultList);
                        return $q.when(currentCollection);
                    }
                    else {
                        return $q.reject("expect list");
                    }
                };
                context.setQuery = function (query) {
                    currentCollection = query;
                };
                context.getQuery = function (menuId, actionId, parms) {
                    if (currentCollection /*todo && isSameObject(currentObject, type, id)*/) {
                        return $q.when(currentCollection);
                    }
                    return context.getMenu(menuId).
                        then(function (menu) {
                        var action = menu.actionMember(actionId);
                        var valueParms = _.map(parms, function (p) { return { id: p.id, val: new Spiro.Value(p.val) }; });
                        lastActionFriendlyName = action.extensions().friendlyName;
                        return repLoader.invoke(action, valueParms);
                    }).then(handleResult);
                };
                context.getQueryFromObject = function (objectId, actionId, parms) {
                    if (currentCollection /*todo && isSameObject(currentObject, type, id)*/) {
                        return $q.when(currentCollection);
                    }
                    return context.getObjectByOid(objectId).
                        then(function (object) {
                        var action = object.actionMember(actionId);
                        var valueParms = _.map(parms, function (p) { return { id: p.id, val: new Spiro.Value(p.val) }; });
                        lastActionFriendlyName = action.extensions().friendlyName;
                        return repLoader.invoke(action, valueParms);
                    }).then(handleResult);
                };
                context.setObject = function (co) { return currentObject = co; };
                var currentError = null;
                context.getError = function () { return currentError; };
                context.setError = function (e) { return currentError = e; };
                var previousUrl = null;
                context.getPreviousUrl = function () { return previousUrl; };
                context.setPreviousUrl = function (url) { return previousUrl = url; };
                var selectedChoice = {};
                context.getSelectedChoice = function (parm, search) { return selectedChoice[parm] ? selectedChoice[parm][search] : []; };
                context.setSelectedChoice = function (parm, search, cvm) {
                    selectedChoice[parm] = selectedChoice[parm] || {};
                    selectedChoice[parm][search] = selectedChoice[parm][search] || [];
                    selectedChoice[parm][search].push(cvm);
                };
                context.clearSelectedChoice = function (parm) { return selectedChoice[parm] = null; };
                context.getLastActionFriendlyName = function () {
                    return lastActionFriendlyName;
                };
                context.setLastActionFriendlyName = function (fn) {
                    lastActionFriendlyName = fn;
                };
                // from rh
                var createChoiceViewModels = function (id, searchTerm, p) {
                    var delay = $q.defer();
                    var cvms = _.map(p.choices(), function (v, k) {
                        return Modern.ChoiceViewModel.create(v, id, k, searchTerm);
                    });
                    delay.resolve(cvms);
                    return delay.promise;
                };
                context.prompt = function (promptRep, id, searchTerm) {
                    promptRep.reset();
                    promptRep.setSearchTerm(searchTerm);
                    var createcvm = (_.partial(createChoiceViewModels, id, searchTerm));
                    return repLoader.populate(promptRep, true).then(createcvm);
                };
                context.conditionalChoices = function (promptRep, id, args) {
                    promptRep.reset();
                    promptRep.setArguments(args);
                    var createcvm = (_.partial(createChoiceViewModels, id, null));
                    return repLoader.populate(promptRep, true).then(createcvm);
                };
                context.setResult = function (action, result, dvm) {
                    if (result.result().isNull() && result.resultType() !== "void") {
                        if (dvm) {
                            dvm.message = "no result found";
                        }
                        return;
                    }
                    var resultObject = result.result().object(); // transient object
                    if (result.resultType() === "object" && resultObject.persistLink()) {
                        var domainType = resultObject.extensions().domainType;
                        resultObject.set("domainType", domainType);
                        resultObject.set("instanceId", "0");
                        resultObject.hateoasUrl = "/" + domainType + "/0";
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
                        var resultList = result.result().list();
                        context.setQuery(resultList);
                        context.setLastActionFriendlyName(action.extensions().friendlyName);
                        urlManager.setQuery(action, dvm);
                    }
                };
                context.setInvokeUpdateError = function (error, vms, vm) {
                    if (error instanceof Spiro.ErrorMap) {
                        _.each(vms, function (vmi) {
                            var errorValue = error.valuesMap()[vmi.id];
                            if (errorValue) {
                                vmi.value = errorValue.value.toValueString();
                                vmi.message = errorValue.invalidReason;
                            }
                        });
                        if (vm) {
                            vm.message = error.invalidReason();
                        }
                    }
                    else if (error instanceof Spiro.ErrorRepresentation) {
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
                context.invokeAction = function (action, dvm) {
                    var invoke = action.getInvoke();
                    var parameters = [];
                    if (dvm) {
                        dvm.clearMessages();
                        parameters = dvm.parameters;
                        _.each(parameters, function (parm) { return invoke.setParameter(parm.id, parm.getValue()); });
                        _.each(parameters, function (parm) { return parm.setSelectedChoice(); });
                    }
                    repLoader.populate(invoke, true).
                        then(function (result) {
                        context.setResult(action, result, dvm);
                    }).
                        catch(function (error) {
                        context.setInvokeUpdateError(error, parameters, dvm);
                    });
                };
                context.updateObject = function ($scope, object, ovm) {
                    var update = object.getUpdateMap();
                    var properties = _.filter(ovm.properties, function (property) { return property.isEditable; });
                    _.each(properties, function (property) { return update.setProperty(property.id, property.getValue()); });
                    repLoader.populate(update, true, new Spiro.DomainObjectRepresentation()).
                        then(function (updatedObject) {
                        // This is a kludge because updated object has no self link.
                        var rawLinks = object.get("links");
                        updatedObject.set("links", rawLinks);
                        // remove pre-changed object from cache
                        $cacheFactory.get("$http").remove(updatedObject.url());
                        context.setObject(updatedObject);
                        urlManager.setObject(updatedObject);
                    }).
                        catch(function (error) {
                        context.setInvokeUpdateError(error, properties, ovm);
                    });
                };
                context.saveObject = function ($scope, object, ovm) {
                    var persist = object.getPersistMap();
                    var properties = _.filter(ovm.properties, function (property) { return property.isEditable; });
                    _.each(properties, function (property) { return persist.setMember(property.id, property.getValue()); });
                    repLoader.populate(persist, true, new Spiro.DomainObjectRepresentation()).
                        then(function (updatedObject) {
                        context.setObject(updatedObject);
                    }).
                        catch(function (error) {
                        context.setInvokeUpdateError(error, properties, ovm);
                    });
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.context.js.map