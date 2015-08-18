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


module Spiro.Angular.Modern{

    export interface IViewModelFactory {
        errorViewModel(errorRep: ErrorRepresentation): ErrorViewModel;
        linkViewModel(linkRep: Link, click? : () => void): LinkViewModel;
        itemViewModel(linkRep: Link, parentHref: string): ItemViewModel;
        parameterViewModel(parmRep: Parameter, id: string, previousValue: string): ParameterViewModel;
        actionViewModel(actionRep: ActionMember,  id : string, invoke : () => void): ActionViewModel;
        dialogViewModel(actionRep: ActionMember, invoke: (dvm: DialogViewModel) => void): DialogViewModel;
        propertyViewModel(propertyRep: PropertyMember, id: string): PropertyViewModel;
        collectionViewModel(collection: any, populateItems?: boolean): CollectionViewModel;
        collectionViewModel(collection: CollectionMember, populateItems?: boolean): CollectionViewModel;
        collectionViewModel(collection: CollectionRepresentation, populateItems?: boolean): CollectionViewModel;
        collectionViewModel(collection: ListRepresentation, populateItems?: boolean): CollectionViewModel;
        servicesViewModel(servicesRep: DomainServicesRepresentation): ServicesViewModel;
        menusViewModel(menusRep: MenusRepresentation): MenusViewModel;
        serviceViewModel(serviceRep: DomainObjectRepresentation): ServiceViewModel;
        domainObjectViewModel(objectRep: DomainObjectRepresentation, save?: (ovm: DomainObjectViewModel) => void, previousUrl? : string): DomainObjectViewModel;
    }

    app.service('viewModelFactory', function($q: ng.IQService, $location: ng.ILocationService, $filter: ng.IFilterService, urlHelper: IUrlHelper, repLoader: IRepLoader, color: IColor, context: IContext, repHandlers: IRepHandlers, mask: IMask, $cacheFactory : ng.ICacheFactoryService, urlManager : IUrlManager ) {

        var viewModelFactory = <IViewModelFactory>this;

        // tested
        viewModelFactory.errorViewModel = (errorRep: ErrorRepresentation) => {
            var errorViewModel = new ErrorViewModel();
            errorViewModel.message = errorRep.message() || "An Error occurred";
            var stackTrace = errorRep.stacktrace();

            errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace;
            return errorViewModel;
        };

        // tested
        viewModelFactory.linkViewModel = (linkRep: Link, click? : () => void) => {
            var linkViewModel = new LinkViewModel();
            linkViewModel.title = linkRep.title();
            linkViewModel.href = urlHelper.toAppUrl(linkRep.href());
            linkViewModel.color = color.toColorFromHref(linkRep.href());

            if (click) {
                linkViewModel.doClick = click;
            }

            return linkViewModel;
        };

        // tested
        viewModelFactory.itemViewModel = (linkRep: Link, parentHref: string) => {
            var itemViewModel = new ItemViewModel();
            itemViewModel.title = linkRep.title();
            itemViewModel.href = urlHelper.toItemUrl(parentHref, linkRep.href());
            itemViewModel.color = color.toColorFromHref(linkRep.href());

            return itemViewModel;
        };

       
        function addAutoAutoComplete(valueViewModel: ValueViewModel, currentChoice : ChoiceViewModel, id : string, currentValue : Value) {
            valueViewModel.hasAutoAutoComplete = true;

            const cache = $cacheFactory.get("recentlyViewed");

            valueViewModel.choice = currentChoice;

            // make sure current value is cached so can be recovered ! 

            const key = valueViewModel.returnType;
            const subKey = valueViewModel.reference;
            const dict = cache.get(key) || {};
            dict[subKey] = { value: currentValue, name : currentValue.toString() };
            cache.put(key, dict);

            // bind in autoautocomplete into prompt 

            valueViewModel.prompt = (st: string) => {

                var defer = $q.defer<ChoiceViewModel[]>();
                var filtered = _.filter(dict, (i: { value: Value, name : string }) =>
                    i.name.toString().toLowerCase().indexOf(st.toLowerCase()) > -1);
                var ccs = _.map(filtered, (i: { value: Value, name : string }) => ChoiceViewModel.create(i.value, id, i.name));

                defer.resolve(ccs);

                return defer.promise;
            }

        }

         // tested
        viewModelFactory.parameterViewModel = (parmRep: Parameter, id: string, previousValue: string) => {
            var parmViewModel = new ParameterViewModel();

            parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";
            parmViewModel.title = parmRep.extensions().friendlyName;
            parmViewModel.dflt = parmRep.default().toValueString();
            parmViewModel.message = "";
            parmViewModel.mask = parmRep.extensions["x-ro-nof-mask"];
            parmViewModel.id = id;
            parmViewModel.argId = id.toLowerCase();
            parmViewModel.returnType = parmRep.extensions().returnType;
            parmViewModel.format = parmRep.extensions().format;
            parmViewModel.reference = "";

            parmViewModel.choices = _.map(parmRep.choices(), (v, n) => {
                return ChoiceViewModel.create(v, id, n);
            });

            parmViewModel.hasChoices = parmViewModel.choices.length > 0;
            parmViewModel.hasPrompt = !!parmRep.promptLink() && !!parmRep.promptLink().arguments()["x-ro-searchTerm"];
            parmViewModel.hasConditionalChoices = !!parmRep.promptLink() && !parmViewModel.hasPrompt;
            parmViewModel.isMultipleChoices = (parmViewModel.hasChoices || parmViewModel.hasConditionalChoices) && parmRep.extensions().returnType === "list";

            if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {

                var promptRep = parmRep.getPrompts();
                if (parmViewModel.hasPrompt) {
                    parmViewModel.prompt = <(st: string) => ng.IPromise<ChoiceViewModel[]>> _.partial(repHandlers.prompt, promptRep, id);
                    parmViewModel.minLength = parmRep.promptLink().extensions().minLength;
                }

                if (parmViewModel.hasConditionalChoices) {
                    parmViewModel.conditionalChoices = <(args: IValueMap) => ng.IPromise<ChoiceViewModel[]>> _.partial(repHandlers.conditionalChoices, promptRep, id);
                    parmViewModel.arguments = _.object<IValueMap>(_.map(<_.Dictionary<Object>>parmRep.promptLink().arguments(), (v: any, key) => [key, new Value(v.value)]));
                }
            }

            if (parmViewModel.hasChoices || parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                
                if (parmViewModel.isMultipleChoices) {                
                    parmViewModel.setSelectedChoice = () => {
                        var search = parmViewModel.getMemento();
                        _.forEach(parmViewModel.multiChoices, (c) => {
                            context.setSelectedChoice(id, search, c);
                        });  
                    };         
                } else {
                   
                    parmViewModel.setSelectedChoice = () =>  {
                        context.setSelectedChoice(id, parmViewModel.getMemento(), parmViewModel.choice);
                    };
                }

                function setCurrentChoices(choices : ChoiceViewModel[]) {
                    if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                        parmViewModel.multiChoices = choices;
                    } else {
                        parmViewModel.multiChoices = _.filter(parmViewModel.choices, (c: ChoiceViewModel) => {
                            return _.any(choices, (cvm: ChoiceViewModel) => {
                                return c.match(cvm);
                            });
                        });
                    }
                }

                function setCurrentChoice(choice: ChoiceViewModel) {
                    if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                        parmViewModel.choice = choice;
                    } else {
                        parmViewModel.choice = _.find(parmViewModel.choices, (c: ChoiceViewModel) => {
                            return c.match(choice);
                        });
                    }
                }

                if (previousValue) {                            
                    if (parmViewModel.isMultipleChoices) {
                        var scs = context.getSelectedChoice(id, previousValue);
                        setCurrentChoices(scs);
                    } else {
                        var sc = context.getSelectedChoice(id, previousValue).pop();
                        setCurrentChoice(sc);
                    }
                } else if (parmViewModel.dflt) {
                    let dflt = parmRep.default();
                  
                    if (parmViewModel.isMultipleChoices) {
                        var dfltChoices = _.map(dflt.list(), (v) => {
                            return ChoiceViewModel.create(v, parmViewModel.id, v.link() ? v.link().title() : null);
                        });
                        setCurrentChoices(dfltChoices);
                    } else {
                        var dfltChoice = ChoiceViewModel.create(dflt, parmViewModel.id, dflt.link() ? dflt.link().title() : null);
                        setCurrentChoice(dfltChoice);
                    }
                }
                // clear any previous 
                context.clearSelectedChoice(parmViewModel.id);
               
            } else {
                if (parmRep.extensions().returnType === "boolean") {
                    parmViewModel.value = previousValue ? previousValue.toLowerCase() === 'true' : parmRep.default().scalar();
                } else {
                    parmViewModel.value = previousValue || parmViewModel.dflt;
                }
            }

            var remoteMask = parmRep.extensions()["x-ro-nof-mask"];

            if (remoteMask && parmRep.isScalar()) {
                var localFilter = mask.toLocalFilter(remoteMask);
                if (localFilter) {
                    parmViewModel.value = $filter(localFilter.name)(parmViewModel.value, localFilter.mask);
                }
            }

            if (parmViewModel.type === "ref" && !parmViewModel.hasPrompt && !parmViewModel.hasChoices && !parmViewModel.hasConditionalChoices) {

                var currentChoice : ChoiceViewModel = null;

                if (previousValue) {
                    currentChoice = context.getSelectedChoice(id, previousValue).pop();
                }
                else if (parmViewModel.dflt) {
                    let dflt = parmRep.default();
                    currentChoice =  ChoiceViewModel.create(dflt, parmViewModel.id,  dflt.link().title());
                }
                context.clearSelectedChoice(parmViewModel.id);

                var currentValue = new Value( currentChoice ?  { href: currentChoice.value, title : currentChoice.name } : "");
              
                addAutoAutoComplete(parmViewModel, currentChoice, id, currentValue);
            } 


            return parmViewModel;
        };

        // tested
        viewModelFactory.actionViewModel = (actionRep: ActionMember, id: string, invoke: () => void) => {
            var actionViewModel = new ActionViewModel();
            
            actionViewModel.title = actionRep.extensions().friendlyName;
            actionViewModel.href = urlHelper.toActionUrl(actionRep.detailsLink().href());

            if (actionRep.extensions().hasParams) {
                actionViewModel.doInvoke = () => {
                    // show the dialog 
                    urlManager.setDialog(id);
                }
            } else {
                actionViewModel.doInvoke = invoke;
            }

            return actionViewModel;
        };

        // tested
        viewModelFactory.dialogViewModel = (actionMember: ActionMember, invoke: (dvm: DialogViewModel) => void) => {
            var dialogViewModel = new DialogViewModel();
            var parameters = actionMember.parameters();
            //var parms = [];//urlHelper.actionParms();

            dialogViewModel.title = actionMember.extensions().friendlyName;
            dialogViewModel.isQuery = actionMember.invokeLink().method() === "GET";

            dialogViewModel.message = "";

            dialogViewModel.close = urlHelper.toAppUrl(actionMember.parent.selfLink().href(), ["action"]);

            var i = 0;
            dialogViewModel.parameters = _.map(parameters, (parm, id?) => { return viewModelFactory.parameterViewModel(parm, id, ""); });

            dialogViewModel.doShow = () => {
                dialogViewModel.show = true;
                invoke(dialogViewModel);
            };
            dialogViewModel.doInvoke = () => {
                dialogViewModel.show = false;
                invoke(dialogViewModel);
            };

            return dialogViewModel;
        };

        viewModelFactory.propertyViewModel = (propertyRep: PropertyMember, id: string) => {
            var propertyViewModel = new PropertyViewModel();
            propertyViewModel.title = propertyRep.extensions().friendlyName;
            propertyViewModel.value = propertyRep.isScalar() ? propertyRep.value().scalar() : propertyRep.value().toString();
            propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
            propertyViewModel.returnType = propertyRep.extensions().returnType;
            propertyViewModel.format = propertyRep.extensions().format;
            propertyViewModel.href = propertyRep.isScalar() || propertyRep.detailsLink() == null ? "" : urlHelper.toNewAppUrl2(propertyRep.value().link().href());
            propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : urlHelper.toAppUrl(propertyRep.value().link().href());
            propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();


            if (propertyRep.attachmentLink() != null) {
                propertyViewModel.attachment = AttachmentViewModel.create(propertyRep.attachmentLink().href(),
                    propertyRep.attachmentLink().type().asString,
                    propertyRep.attachmentLink().title());
            }

            // only set color if has value 
            propertyViewModel.color = propertyViewModel.value ? color.toColorFromType(propertyRep.extensions().returnType) : "";

            propertyViewModel.id = id;
            propertyViewModel.argId = id.toLowerCase();
            propertyViewModel.isEditable = !propertyRep.disabledReason();
            propertyViewModel.choices = [];
            propertyViewModel.hasPrompt = propertyRep.hasPrompt();

            if (propertyRep.hasChoices()) {
                
                var choices =  propertyRep.choices();

                if (choices) {
                    propertyViewModel.choices = _.map(choices, (v, n) => {
                        return ChoiceViewModel.create(v, id, n);
                    });
                }
            }

            propertyViewModel.hasChoices = propertyViewModel.choices.length > 0;
            propertyViewModel.hasPrompt = !!propertyRep.promptLink() && propertyRep.promptLink().arguments()["x-ro-searchTerm"];
            propertyViewModel.hasConditionalChoices =  !!propertyRep.promptLink() && !propertyViewModel.hasPrompt;

            if (propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {
                var promptRep: PromptRepresentation = propertyRep.getPrompts();

                if (propertyViewModel.hasPrompt) {         
                    propertyViewModel.prompt = <(st: string) => ng.IPromise<ChoiceViewModel[]>> _.partial(repHandlers.prompt, promptRep, id);
                    propertyViewModel.minLength = propertyRep.promptLink().extensions().minLength;
                } 

                if (propertyViewModel.hasConditionalChoices) {
                    propertyViewModel.conditionalChoices = <(args: IValueMap) => ng.IPromise<ChoiceViewModel[]>> _.partial(repHandlers.conditionalChoices, promptRep, id);
                    propertyViewModel.arguments = _.object<IValueMap>(_.map(<_.Dictionary<Object>>propertyRep.promptLink().arguments(), (v: any, key) => [key, new Value(v.value)]));        
                }
            }

            if (propertyViewModel.hasChoices || propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {

                var currentChoice: ChoiceViewModel = ChoiceViewModel.create(propertyRep.value(), id);

                if (propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {
                    propertyViewModel.choice = currentChoice;
                } else {
                    propertyViewModel.choice = _.find(propertyViewModel.choices, (c: ChoiceViewModel) => c.match(currentChoice));
                }
            } 

            var remoteMask = propertyRep.extensions()["x-ro-nof-mask"];

            if (remoteMask && propertyRep.isScalar()) {
                var localFilter = mask.toLocalFilter(remoteMask);
                if (localFilter) {
                    propertyViewModel.value = $filter(localFilter.name)(propertyViewModel.value, localFilter.mask);
                }
            }

            // if a reference and no way to set (ie not choices or autocomplete) use autoautocomplete
            if (propertyViewModel.type === "ref" && !propertyViewModel.hasPrompt && !propertyViewModel.hasChoices && !propertyViewModel.hasConditionalChoices) {
                addAutoAutoComplete(propertyViewModel, ChoiceViewModel.create(propertyRep.value(), id), id, propertyRep.value());            
            } 

            return propertyViewModel;
        };
        
         // tested
        function create(collectionRep: CollectionMember) {
            const collectionViewModel = new CollectionViewModel();
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = collectionRep.size();
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = collectionRep.detailsLink() ? urlHelper.toCollectionUrl(collectionRep.detailsLink().href()) : "";
            collectionViewModel.color = color.toColorFromType(collectionRep.extensions().elementType);

            collectionViewModel.items = [];

            return collectionViewModel;
        }

        function getItems(cvm : CollectionViewModel, links: Link[], href: string, populateItems?: boolean) {

            if (populateItems) {
                return _.map(links, (link) => {
                    var ivm = viewModelFactory.itemViewModel(link, href);
                    var tempTgt = link.getTarget();
                    repLoader.populate<DomainObjectRepresentation>(tempTgt).then((obj: DomainObjectRepresentation) => {
                        ivm.target = viewModelFactory.domainObjectViewModel(obj);

                        if (!cvm.header) {
                            cvm.header = _.map(ivm.target.properties, (property: PropertyViewModel) => property.title);
                        }

                    });
                    return ivm;
                });
            } else {
                return _.map(links, (link) => { return viewModelFactory.itemViewModel(link, href); });
            }
        }

        // tested
        function createFromDetails(collectionRep: CollectionRepresentation, populateItems?: boolean) {
            const collectionViewModel = new CollectionViewModel();
            const links = collectionRep.value().models;
            collectionViewModel.title = collectionRep.extensions().friendlyName;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = collectionRep.extensions().pluralName;

            collectionViewModel.href = urlHelper.toCollectionUrl(collectionRep.selfLink().href());
            collectionViewModel.color = color.toColorFromType(collectionRep.extensions().elementType);

            collectionViewModel.items = getItems(collectionViewModel, links, collectionViewModel.href, populateItems);

            return collectionViewModel;
        }

        // tested
        function createFromList(listRep: ListRepresentation, populateItems?: boolean) {
            const collectionViewModel = new CollectionViewModel();
            const links = listRep.value().models;
            collectionViewModel.size = links.length;
            collectionViewModel.pluralName = "Objects";

            collectionViewModel.items = getItems(collectionViewModel, links, $location.path(), populateItems);

            return collectionViewModel;
        }

        // tested
        viewModelFactory.collectionViewModel = (collection: any, populateItems?: boolean) => {
            if (collection instanceof CollectionMember) {
                return create(<CollectionMember>collection);
            }
            if (collection instanceof CollectionRepresentation) {
                return createFromDetails(<CollectionRepresentation>collection, populateItems);
            }
            if (collection instanceof ListRepresentation) {
                return createFromList(<ListRepresentation>collection, populateItems);
            }
            return null;
        };

        // tested
        viewModelFactory.servicesViewModel = (servicesRep: DomainServicesRepresentation) => {
            var servicesViewModel = new ServicesViewModel();

            // filter out contributed action services 
            var links = _.filter(servicesRep.value().models, (m: Link) => {
                var sid = m.rel().parms[0].split('=')[1];
                return sid.indexOf("ContributedActions") === -1; 
            });
            
            servicesViewModel.title = "Services";
            servicesViewModel.color = "bg-color-darkBlue";
            servicesViewModel.items = _.map(links, (link) => { return viewModelFactory.linkViewModel(link); });
            return servicesViewModel;
        };

        viewModelFactory.menusViewModel = (menusRep: MenusRepresentation) => {
            var menusViewModel = new MenusViewModel();

            menusViewModel.title = "Menus";
            menusViewModel.color = "bg-color-darkBlue";
            //todo use regex!
            menusViewModel.items = _.map(menusRep.value().models, (link) => { return viewModelFactory.linkViewModel(link, () => urlManager.setMenu(link.rel().parms[0].split("=")[1].replace("\"", "").replace("\"", "")     ) ); });
            return menusViewModel;
        };



        // tested
        viewModelFactory.serviceViewModel = (serviceRep: DomainObjectRepresentation) => {
            var serviceViewModel = new ServiceViewModel();
            var actions = serviceRep.actionMembers();
            serviceViewModel.serviceId = serviceRep.serviceId();
            serviceViewModel.title = serviceRep.title();
            serviceViewModel.actions = _.map(actions, (action, id) => { return viewModelFactory.actionViewModel(action, id, () => null); });
            serviceViewModel.color = color.toColorFromType(serviceRep.serviceId());
            serviceViewModel.href = urlHelper.toAppUrl(serviceRep.getUrl());
          

            return serviceViewModel;
        };

        // tested
        viewModelFactory.domainObjectViewModel = (objectRep: DomainObjectRepresentation, save?: (ovm: DomainObjectViewModel) => void) => {
            var objectViewModel = new DomainObjectViewModel();
            var isTransient = !!objectRep.persistLink();

            objectViewModel.href = urlHelper.toNewAppUrl(objectRep.getUrl());

            objectViewModel.cancelEdit =  isTransient ? ""  :  urlHelper.toAppUrl(objectRep.getUrl());

            objectViewModel.color = color.toColorFromType(objectRep.domainType());

            objectViewModel.doSave = save ? () => save(objectViewModel) : () => { };

            var properties = objectRep.propertyMembers();
            var collections = objectRep.collectionMembers();
            var actions = objectRep.actionMembers();

            objectViewModel.domainType = objectRep.domainType();
            objectViewModel.title = isTransient ? "Unsaved " + objectRep.extensions().friendlyName : objectRep.title();

            objectViewModel.message = "";

            objectViewModel.properties = _.map(properties, (property, id?) => { return viewModelFactory.propertyViewModel(property, id); });
            objectViewModel.collections = _.map(collections, (collection) => { return viewModelFactory.collectionViewModel(collection); });
            objectViewModel.actions = _.map(actions, (action, id) => { return viewModelFactory.actionViewModel(action, id, null); });

            return objectViewModel;
        };
    });

}