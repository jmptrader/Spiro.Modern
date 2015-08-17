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
            Angular.app.service("context", function ($q, repLoader) {
                var context = this;
                var currentHome = null;
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
                // exposed for test mocking
                context.getDomainObject = function (type, id) {
                    var object = new Spiro.DomainObjectRepresentation();
                    object.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;
                    return repLoader.populate(object);
                };
                // exposed for test mocking
                var currentObject;
                context.getService = function (type) {
                    var delay = $q.defer();
                    this.getServices().
                        then(function (services) {
                        var serviceLink = _.find(services.value().models, function (model) { return model.rel().parms[0] === "serviceId=\"" + type + "\""; });
                        var service = serviceLink.getTarget();
                        return repLoader.populate(service);
                    }).
                        then(function (service) {
                        currentObject = service;
                        delay.resolve(service);
                    }, function (error) { return delay.reject(error); });
                    return delay.promise;
                };
                context.getMenu = function (menuId) {
                    var delay = $q.defer();
                    this.getMenus().
                        then(function (menus) {
                        var menuLink = _.find(menus.value().models, function (model) { return model.rel().parms[0] === "menuId=\"" + menuId + "\""; });
                        var menu = menuLink.getTarget();
                        return repLoader.populate(menu);
                    }).
                        then(function (menu) {
                        delay.resolve(menu);
                    }, function (error) { return delay.reject(error); });
                    return delay.promise;
                };
                // tested
                context.getHome = function () {
                    var delay = $q.defer();
                    if (currentHome) {
                        delay.resolve(currentHome);
                    }
                    else {
                        repLoader.populate(new Spiro.HomePageRepresentation()).
                            then(function (home) {
                            currentHome = home;
                            delay.resolve(home);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                var currentServices = null;
                // tested
                context.getServices = function () {
                    var delay = $q.defer();
                    if (currentServices) {
                        delay.resolve(currentServices);
                    }
                    else {
                        this.getHome().
                            then(function (home) {
                            var ds = home.getDomainServices();
                            return repLoader.populate(ds);
                        }).
                            then(function (services) {
                            currentServices = services;
                            delay.resolve(services);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                var currentMenus = null;
                context.getMenus = function () {
                    var delay = $q.defer();
                    if (currentMenus) {
                        delay.resolve(currentMenus);
                    }
                    else {
                        this.getHome().
                            then(function (home) {
                            var ds = home.getMenus();
                            return repLoader.populate(ds);
                        }).
                            then(function (menus) {
                            currentMenus = menus;
                            delay.resolve(menus);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                var currentVersion = null;
                context.getVersion = function () {
                    var delay = $q.defer();
                    if (currentVersion) {
                        delay.resolve(currentVersion);
                    }
                    else {
                        this.getHome().
                            then(function (home) {
                            var v = home.getVersion();
                            return repLoader.populate(v);
                        }).
                            then(function (version) {
                            currentVersion = version;
                            delay.resolve(version);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                currentObject = null; // tested
                context.getObject = function (type, id) {
                    var delay = $q.defer();
                    if (currentObject && isSameObject(currentObject, type, id)) {
                        delay.resolve(currentObject);
                    }
                    else {
                        var promise = id ? this.getDomainObject(type, id) : this.getService(type);
                        promise.then(function (object) {
                            currentObject = object;
                            delay.resolve(object);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                context.setObject = function (co) { return currentObject = co; };
                var currentNestedObject = null;
                // tested
                context.getNestedObject = function (type, id) {
                    var delay = $q.defer();
                    if (currentNestedObject && isSameObject(currentNestedObject, type, id)) {
                        delay.resolve(currentNestedObject);
                    }
                    else {
                        var domainObjectRepresentation = new Spiro.DomainObjectRepresentation();
                        domainObjectRepresentation.hateoasUrl = getAppPath() + "/objects/" + type + "/" + id;
                        repLoader.populate(domainObjectRepresentation).
                            then(function (dor) {
                            currentNestedObject = dor;
                            delay.resolve(dor);
                        }, function (error) { return delay.reject(error); });
                    }
                    return delay.promise;
                };
                context.setNestedObject = function (cno) { return currentNestedObject = cno; };
                var currentError = null;
                context.getError = function () { return currentError; };
                context.setError = function (e) { return currentError = e; };
                var currentCollection = null;
                // tested
                context.getCollection = function () {
                    var delay = $q.defer();
                    delay.resolve(currentCollection);
                    return delay.promise;
                };
                context.setCollection = function (c) { return currentCollection = c; };
                var currentTransient = null;
                // tested
                context.getTransientObject = function () {
                    var delay = $q.defer();
                    delay.resolve(currentTransient);
                    return delay.promise;
                };
                context.setTransientObject = function (t) { return currentTransient = t; };
                var previousUrl = null;
                context.getPreviousUrl = function () { return previousUrl; };
                context.setPreviousUrl = function (url) { return previousUrl = url; };
                var selectedChoice = {};
                context.getSelectedChoice = function (parm, search) { return selectedChoice[parm] ? selectedChoice[parm][search] : []; };
                // tested
                context.setSelectedChoice = function (parm, search, cvm) {
                    selectedChoice[parm] = selectedChoice[parm] || {};
                    selectedChoice[parm][search] = selectedChoice[parm][search] || [];
                    selectedChoice[parm][search].push(cvm);
                };
                context.clearSelectedChoice = function (parm) { return selectedChoice[parm] = null; };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.context.js.map