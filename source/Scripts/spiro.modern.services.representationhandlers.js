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
            Angular.app.service("repHandlers", function ($q, $location, $cacheFactory, repLoader, context, urlHelper, urlManager) {
                var repHandlers = this;
                repHandlers.prompt = function (promptRep, id, searchTerm) {
                    promptRep.reset();
                    promptRep.setSearchTerm(searchTerm);
                    return repLoader.populate(promptRep, true).then(function (p) {
                        var delay = $q.defer();
                        var cvms = _.map(p.choices(), function (v, k) {
                            return Modern.ChoiceViewModel.create(v, id, k, searchTerm);
                        });
                        delay.resolve(cvms);
                        return delay.promise;
                    });
                };
                repHandlers.conditionalChoices = function (promptRep, id, args) {
                    promptRep.reset();
                    promptRep.setArguments(args);
                    return repLoader.populate(promptRep, true).then(function (p) {
                        var delay = $q.defer();
                        var cvms = _.map(p.choices(), function (v, k) {
                            return Modern.ChoiceViewModel.create(v, id, k);
                        });
                        delay.resolve(cvms);
                        return delay.promise;
                    });
                };
                repHandlers.setResult = function (action, result, dvm) {
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
                        context.setTransientObject(resultObject);
                        context.setPreviousUrl($location.path());
                        $location.path(urlHelper.toTransientObjectPath(resultObject));
                    }
                    // persistent object
                    if (result.resultType() === "object" && !resultObject.persistLink()) {
                        // set the nested object here and then update the url. That should reload the page but pick up this object 
                        // so we don't hit the server again. 
                        context.setNestedObject(resultObject);
                        urlManager.setObject(resultObject);
                    }
                    if (result.resultType() === "list") {
                        var resultList = result.result().list();
                        context.setCollection(resultList);
                        urlManager.setQuery(action, dvm);
                    }
                };
                repHandlers.setInvokeUpdateError = function (error, vms, vm) {
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
                        $location.path(urlHelper.toErrorPath());
                    }
                    else {
                        if (vm) {
                            vm.message = error;
                        }
                    }
                };
                // todo this code is nearly duplicated in context - DRY it
                repHandlers.invokeAction = function (action, dvm) {
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
                        repHandlers.setResult(action, result, dvm);
                    }, function (error) {
                        repHandlers.setInvokeUpdateError(error, parameters, dvm);
                    });
                };
                repHandlers.updateObject = function ($scope, object, ovm) {
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
                    }, function (error) {
                        repHandlers.setInvokeUpdateError(error, properties, ovm);
                    });
                };
                repHandlers.saveObject = function ($scope, object, ovm) {
                    var persist = object.getPersistMap();
                    var properties = _.filter(ovm.properties, function (property) { return property.isEditable; });
                    _.each(properties, function (property) { return persist.setMember(property.id, property.getValue()); });
                    repLoader.populate(persist, true, new Spiro.DomainObjectRepresentation()).
                        then(function (updatedObject) {
                        context.setObject(updatedObject);
                        $location.path(urlHelper.toObjectPath(updatedObject));
                    }, function (error) {
                        repHandlers.setInvokeUpdateError(error, properties, ovm);
                    });
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.representationhandlers.js.map