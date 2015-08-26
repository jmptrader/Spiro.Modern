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
        setResult(action : ActionMember, result: ActionResultRepresentation, dvm?: DialogViewModel);
        setInvokeUpdateError( error: any, vms: ValueViewModel[], vm?: MessageViewModel);
        invokeAction( action: ActionMember, dvm?: DialogViewModel);
        updateObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);
        saveObject($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel);
    }

    app.service("repHandlers", function ($q: ng.IQService, $location: ng.ILocationService, $cacheFactory: ng.ICacheFactoryService, repLoader: IRepLoader, context : IContext, urlHelper : IUrlHelper, urlManager : IUrlManager) {

        const repHandlers = <IRepHandlers>this;

        repHandlers.prompt = (promptRep: PromptRepresentation, id: string, searchTerm: string): ng.IPromise<ChoiceViewModel[]> => {

            promptRep.reset();
            promptRep.setSearchTerm(searchTerm);

            return repLoader.populate(promptRep, true).then((p: PromptRepresentation) => {
                const delay = $q.defer<ChoiceViewModel[]>();

                const cvms = _.map(p.choices(), (v, k) => {
                    return ChoiceViewModel.create(v, id, k, searchTerm);
                });

                delay.resolve(cvms);
                return delay.promise;
            });
        };

        repHandlers.conditionalChoices = (promptRep: PromptRepresentation, id: string, args: IValueMap): ng.IPromise<ChoiceViewModel[]> => {

            promptRep.reset();
            promptRep.setArguments(args); 

            return repLoader.populate(promptRep, true).then((p: PromptRepresentation) => {
                const delay = $q.defer<ChoiceViewModel[]>();

                const cvms = _.map(p.choices(), (v, k) => {
                    return ChoiceViewModel.create(v, id, k);
                });

                delay.resolve(cvms);
                return delay.promise;
            });
        };

        repHandlers.setResult = (action: ActionMember, result: ActionResultRepresentation, dvm?: DialogViewModel) => {
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

                //context.setPreviousUrl($location.path());
                //$location.path(urlHelper.toTransientObjectPath(resultObject));
                urlManager.setObject(resultObject);
            }

            // persistent object
            if (result.resultType() === "object" && !resultObject.persistLink()) {

                // set the nested object here and then update the url. That should reload the page but pick up this object 
                // so we don't hit the server again. 

                context.setObject(resultObject);
                urlManager.setObject(resultObject, true);
            }

            if (result.resultType() === "list") {
                const resultList = result.result().list();
                context.setCollection(resultList);
                context.setLastActionFriendlyName(action.extensions().friendlyName);
                urlManager.setQuery(action, dvm);
            }
        };

        repHandlers.setInvokeUpdateError = (error: any, vms: ValueViewModel[], vm?: MessageViewModel) => {
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
                $location.path(urlHelper.toErrorPath());
            }
            else {
                if (vm) {
                    vm.message = error;
                }
            }
        };

        // todo this code is nearly duplicated in context - DRY it
        repHandlers.invokeAction = ( action: ActionMember, dvm?: DialogViewModel) => {
            const invoke = action.getInvoke();
            let parameters : ParameterViewModel[] = [];

            if (dvm) {
                dvm.clearMessages();
                parameters = dvm.parameters;
                _.each(parameters, (parm) => invoke.setParameter(parm.id, parm.getValue()));
                _.each(parameters, (parm) => parm.setSelectedChoice());
            }

            repLoader.populate(invoke, true).
                then((result: ActionResultRepresentation) => {
                    repHandlers.setResult(action, result, dvm);
                }, (error: any) => {
                    repHandlers.setInvokeUpdateError( error, parameters, dvm);
                });
        };

        repHandlers.updateObject = ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) => {
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
                }, (error: any) => {
                    repHandlers.setInvokeUpdateError( error, properties, ovm);
                });
        };

        repHandlers.saveObject = ($scope, object: DomainObjectRepresentation, ovm: DomainObjectViewModel) => {
            const persist = object.getPersistMap();

            const properties = _.filter(ovm.properties, property => property.isEditable);
            _.each(properties, property => persist.setMember(property.id, property.getValue()));

            repLoader.populate(persist, true, new DomainObjectRepresentation()).
                then((updatedObject: DomainObjectRepresentation) => {
                    context.setObject(updatedObject);
                    $location.path(urlHelper.toObjectPath(updatedObject));
                }, (error: any) => {
                    repHandlers.setInvokeUpdateError( error, properties, ovm);
                });
        };

    });
}
