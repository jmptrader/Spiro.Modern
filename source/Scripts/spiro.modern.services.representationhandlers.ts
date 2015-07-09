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

    export interface IRepHandlers {
        prompt(promptRep: PromptRepresentation, id: string, searchTerm: string): ng.IPromise<ChoiceViewModel[]>;
        conditionalChoices(promptRep: PromptRepresentation, id: string, args: IValueMap): ng.IPromise<ChoiceViewModel[]>;
        setResult(result: ActionResultRepresentation, dvm?: DialogViewModel);
        setInvokeUpdateError($scope, error: any, vms: ValueViewModel[], vm: MessageViewModel);
        invokeAction($scope, action: ActionRepresentation, dvm: DialogViewModel);
        updateObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);
        saveObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);
    }

    app.service('repHandlers', function ($q: ng.IQService, $location: ng.ILocationService, $cacheFactory: ng.ICacheFactoryService, repLoader: IRepLoader, context : IContext, urlHelper : IUrlHelper) {

        var repHandlers = <IRepHandlers>this;

        repHandlers.prompt = function (promptRep: PromptRepresentation, id: string, searchTerm: string): ng.IPromise<ChoiceViewModel[]> {

            promptRep.reset();
            promptRep.setSearchTerm(searchTerm);

            return repLoader.populate(promptRep, true).then((p: PromptRepresentation) => {
                var delay = $q.defer<ChoiceViewModel[]>();

                var cvms = _.map(p.choices(), (v, k) => {
                    return ChoiceViewModel.create(v, id, k, searchTerm);
                });

                delay.resolve(cvms);
                return delay.promise;
            });
        };

        repHandlers.conditionalChoices = function (promptRep: PromptRepresentation, id: string, args: IValueMap): ng.IPromise<ChoiceViewModel[]> {

            promptRep.reset();
            promptRep.setArguments(args); 

            return repLoader.populate(promptRep, true).then((p: PromptRepresentation) => {
                var delay = $q.defer<ChoiceViewModel[]>();

                var cvms = _.map(p.choices(), (v, k) => {
                    return ChoiceViewModel.create(v, id, k);
                });

                delay.resolve(cvms);
                return delay.promise;
            });
        };

        repHandlers.setResult = function (result: ActionResultRepresentation, dvm?: DialogViewModel) {
            if (result.result().isNull() && result.resultType() !== "void") {
                if (dvm) {
                    dvm.message = "no result found";
                }
                return;
            }

            var parms = "";
            const resultObject = result.result().object(); // transient object

            if (result.resultType() === "object" && resultObject.persistLink()) {
                const domainType = resultObject.extensions().domainType;
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
                parms = urlHelper.updateParms(resultObject, dvm);
            }

            if (result.resultType() === "list") {
                const resultList = result.result().list();
                context.setCollection(resultList);
                parms = urlHelper.updateParms(resultList, dvm);
            }

            $location.search(parms);
        };

        repHandlers.setInvokeUpdateError = function ($scope, error: any, vms: ValueViewModel[], vm: MessageViewModel) {
            if (error instanceof ErrorMap) {
                _.each(vms, (vmi) => {
                    var errorValue = error.valuesMap()[vmi.id];

                    if (errorValue) {
                        vmi.value = errorValue.value.toValueString();
                        vmi.message = errorValue.invalidReason;
                    }
                });
                vm.message = (<ErrorMap>error).invalidReason();
            }
            else if (error instanceof ErrorRepresentation) {
                context.setError(error);
                $location.path(urlHelper.toErrorPath());
            }
            else {
                vm.message = error;
            }
        };

        repHandlers.invokeAction = function ($scope, action: ActionRepresentation, dvm: DialogViewModel) {
            dvm.clearMessages();

            var invoke = action.getInvoke();
     
            var parameters = dvm.parameters;
            _.each(parameters, (parm) => invoke.setParameter(parm.id, parm.getValue()));
            _.each(parameters, (parm) => parm.setSelectedChoice());

            repLoader.populate(invoke, true).
                then(function (result: ActionResultRepresentation) {
                    repHandlers.setResult(result, dvm);
                }, function (error: any) {
                    repHandlers.setInvokeUpdateError($scope, error, parameters, dvm);
                });
        };

        repHandlers.updateObject = function ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) {
            var update = object.getUpdateMap();

            var properties = _.filter(ovm.properties, (property : PropertyViewModel) => property.isEditable);
            _.each(properties, (property) => update.setProperty(property.id, property.getValue()));

            repLoader.populate(update, true, new DomainObjectRepresentation()).
                then(function (updatedObject: DomainObjectRepresentation) {

                    // This is a kludge because updated object has no self link.
                    const rawLinks = (<any>object).get("links");
                    (<any>updatedObject).set("links", rawLinks);

                    // remove pre-changed object from cache
                    $cacheFactory.get('$http').remove(updatedObject.url());

                    context.setObject(updatedObject);
                    $location.search("");
                }, function (error: any) {
                    repHandlers.setInvokeUpdateError($scope, error, properties, ovm);
                });
        };

        repHandlers.saveObject = function ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) {
            var persist = object.getPersistMap();

            var properties = _.filter(ovm.properties, (property: PropertyViewModel) => property.isEditable);
            _.each(properties, (property: PropertyViewModel) => persist.setMember(property.id, property.getValue()));

            repLoader.populate(persist, true, new DomainObjectRepresentation()).
                then(function (updatedObject: DomainObjectRepresentation) {

                    context.setObject(updatedObject);
                    $location.path(urlHelper.toObjectPath(updatedObject));
                }, function (error: any) {
                    repHandlers.setInvokeUpdateError($scope, error, properties, ovm);
                });
        };

    });
}
