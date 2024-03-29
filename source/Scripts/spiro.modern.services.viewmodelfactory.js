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
            Angular.app.service('viewModelFactory', function ($q, $location, $filter, repLoader, color, context, repHandlers, mask, $cacheFactory, urlManager, navigation) {
                var viewModelFactory = this;
                viewModelFactory.errorViewModel = function (errorRep) {
                    var errorViewModel = new Modern.ErrorViewModel();
                    errorViewModel.message = errorRep.message() || "An Error occurred";
                    var stackTrace = errorRep.stacktrace();
                    errorViewModel.stackTrace = !stackTrace || stackTrace.length === 0 ? ["Empty"] : stackTrace;
                    return errorViewModel;
                };
                viewModelFactory.linkViewModel = function (linkRep) {
                    var linkViewModel = new Modern.LinkViewModel();
                    linkViewModel.title = linkRep.title();
                    linkViewModel.color = color.toColorFromHref(linkRep.href());
                    linkViewModel.doClick = function () { return urlManager.setMenu(linkRep.rel().parms[0].value); };
                    return linkViewModel;
                };
                viewModelFactory.itemViewModel = function (linkRep) {
                    var itemViewModel = new Modern.ItemViewModel();
                    itemViewModel.title = linkRep.title();
                    itemViewModel.color = color.toColorFromHref(linkRep.href());
                    itemViewModel.doClick = function () { return urlManager.setItem(linkRep); };
                    return itemViewModel;
                };
                function addAutoAutoComplete(valueViewModel, currentChoice, id, currentValue) {
                    valueViewModel.hasAutoAutoComplete = true;
                    var cache = $cacheFactory.get("recentlyViewed");
                    valueViewModel.choice = currentChoice;
                    // make sure current value is cached so can be recovered ! 
                    var key = valueViewModel.returnType, subKey = valueViewModel.reference;
                    var dict = cache.get(key) || {};
                    dict[subKey] = { value: currentValue, name: currentValue.toString() };
                    cache.put(key, dict);
                    // bind in autoautocomplete into prompt 
                    valueViewModel.prompt = function (st) {
                        var defer = $q.defer();
                        var filtered = _.filter(dict, function (i) {
                            return i.name.toString().toLowerCase().indexOf(st.toLowerCase()) > -1;
                        });
                        var ccs = _.map(filtered, function (i) { return Modern.ChoiceViewModel.create(i.value, id, i.name); });
                        defer.resolve(ccs);
                        return defer.promise;
                    };
                }
                // tested
                viewModelFactory.parameterViewModel = function (parmRep, previousValue) {
                    var parmViewModel = new Modern.ParameterViewModel();
                    parmViewModel.type = parmRep.isScalar() ? "scalar" : "ref";
                    parmViewModel.dflt = parmRep.default().toValueString();
                    parmViewModel.message = "";
                    parmViewModel.id = parmRep.parameterId();
                    parmViewModel.argId = parmViewModel.id.toLowerCase();
                    parmViewModel.reference = "";
                    parmViewModel.mask = parmRep.extensions()["x-ro-nof-mask"];
                    parmViewModel.title = parmRep.extensions().friendlyName;
                    parmViewModel.returnType = parmRep.extensions().returnType;
                    parmViewModel.format = parmRep.extensions().format;
                    parmViewModel.choices = _.map(parmRep.choices(), function (v, n) {
                        return Modern.ChoiceViewModel.create(v, parmRep.parameterId(), n);
                    });
                    parmViewModel.hasChoices = parmViewModel.choices.length > 0;
                    parmViewModel.hasPrompt = !!parmRep.promptLink() && !!parmRep.promptLink().arguments()["x-ro-searchTerm"];
                    parmViewModel.hasConditionalChoices = !!parmRep.promptLink() && !parmViewModel.hasPrompt;
                    parmViewModel.isMultipleChoices = (parmViewModel.hasChoices || parmViewModel.hasConditionalChoices) && parmRep.extensions().returnType === "list";
                    if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                        var promptRep = parmRep.getPrompts();
                        if (parmViewModel.hasPrompt) {
                            parmViewModel.prompt = _.partial(context.prompt, promptRep, parmViewModel.id);
                            parmViewModel.minLength = parmRep.promptLink().extensions().minLength;
                        }
                        if (parmViewModel.hasConditionalChoices) {
                            parmViewModel.conditionalChoices = _.partial(context.conditionalChoices, promptRep, parmViewModel.id);
                            parmViewModel.arguments = _.object(_.map(parmRep.promptLink().arguments(), function (v, key) { return [key, new Spiro.Value(v.value)]; }));
                        }
                    }
                    if (parmViewModel.hasChoices || parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                        if (parmViewModel.isMultipleChoices) {
                            parmViewModel.setSelectedChoice = function () {
                                var search = parmViewModel.getMemento();
                                _.forEach(parmViewModel.multiChoices, function (c) {
                                    context.setSelectedChoice(parmViewModel.id, search, c);
                                });
                            };
                        }
                        else {
                            parmViewModel.setSelectedChoice = function () {
                                context.setSelectedChoice(parmViewModel.id, parmViewModel.getMemento(), parmViewModel.choice);
                            };
                        }
                        function setCurrentChoices(choices) {
                            if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                                parmViewModel.multiChoices = choices;
                            }
                            else {
                                parmViewModel.multiChoices = _.filter(parmViewModel.choices, function (c) {
                                    return _.any(choices, function (cvm) {
                                        return c.match(cvm);
                                    });
                                });
                            }
                        }
                        function setCurrentChoice(choice) {
                            if (parmViewModel.hasPrompt || parmViewModel.hasConditionalChoices) {
                                parmViewModel.choice = choice;
                            }
                            else {
                                parmViewModel.choice = _.find(parmViewModel.choices, function (c) {
                                    return c.match(choice);
                                });
                            }
                        }
                        if (previousValue) {
                            if (parmViewModel.isMultipleChoices) {
                                var scs = context.getSelectedChoice(parmViewModel.id, previousValue);
                                setCurrentChoices(scs);
                            }
                            else {
                                var sc = context.getSelectedChoice(parmViewModel.id, previousValue).pop();
                                setCurrentChoice(sc);
                            }
                        }
                        else if (parmViewModel.dflt) {
                            var dflt = parmRep.default();
                            if (parmViewModel.isMultipleChoices) {
                                var dfltChoices = _.map(dflt.list(), function (v) {
                                    return Modern.ChoiceViewModel.create(v, parmViewModel.id, v.link() ? v.link().title() : null);
                                });
                                setCurrentChoices(dfltChoices);
                            }
                            else {
                                var dfltChoice = Modern.ChoiceViewModel.create(dflt, parmViewModel.id, dflt.link() ? dflt.link().title() : null);
                                setCurrentChoice(dfltChoice);
                            }
                        }
                        // clear any previous 
                        context.clearSelectedChoice(parmViewModel.id);
                    }
                    else {
                        if (parmRep.extensions().returnType === "boolean") {
                            parmViewModel.value = previousValue ? previousValue.toLowerCase() === 'true' : parmRep.default().scalar();
                        }
                        else {
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
                        var currentChoice = null;
                        if (previousValue) {
                            currentChoice = context.getSelectedChoice(parmViewModel.id, previousValue).pop();
                        }
                        else if (parmViewModel.dflt) {
                            var dflt = parmRep.default();
                            currentChoice = Modern.ChoiceViewModel.create(dflt, parmViewModel.id, dflt.link().title());
                        }
                        context.clearSelectedChoice(parmViewModel.id);
                        var currentValue = new Spiro.Value(currentChoice ? { href: currentChoice.value, title: currentChoice.name } : "");
                        addAutoAutoComplete(parmViewModel, currentChoice, parmViewModel.id, currentValue);
                    }
                    return parmViewModel;
                };
                // tested
                viewModelFactory.actionViewModel = function (actionRep) {
                    var actionViewModel = new Modern.ActionViewModel();
                    actionViewModel.title = actionRep.extensions().friendlyName;
                    actionViewModel.menuPath = actionRep.extensions()["x-ro-nof-menuPath"] || "";
                    actionViewModel.doInvoke = actionRep.extensions().hasParams ? function () { return urlManager.setDialog(actionRep.actionId()); } : function () { return context.invokeAction(actionRep); };
                    return actionViewModel;
                };
                viewModelFactory.dialogViewModel = function (actionMember) {
                    var dialogViewModel = new Modern.DialogViewModel();
                    var parameters = actionMember.parameters();
                    dialogViewModel.title = actionMember.extensions().friendlyName;
                    dialogViewModel.isQuery = actionMember.invokeLink().method() === "GET";
                    dialogViewModel.message = "";
                    dialogViewModel.parameters = _.map(parameters, function (parm) { return viewModelFactory.parameterViewModel(parm, ""); });
                    dialogViewModel.doClose = function () { return urlManager.closeDialog(); };
                    dialogViewModel.doInvoke = function () { return context.invokeAction(actionMember, dialogViewModel); };
                    return dialogViewModel;
                };
                viewModelFactory.propertyViewModel = function (propertyRep, id) {
                    var propertyViewModel = new Modern.PropertyViewModel();
                    propertyViewModel.title = propertyRep.extensions().friendlyName;
                    propertyViewModel.value = propertyRep.isScalar() ? propertyRep.value().scalar() : propertyRep.value().toString();
                    propertyViewModel.type = propertyRep.isScalar() ? "scalar" : "ref";
                    propertyViewModel.returnType = propertyRep.extensions().returnType;
                    propertyViewModel.format = propertyRep.extensions().format;
                    //propertyViewModel.href = propertyRep.isScalar() || propertyRep.value().isNull() || propertyRep.detailsLink() == null ? "" : urlHelper.toNewAppUrl2(propertyRep.value().link().href());
                    //propertyViewModel.target = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : urlHelper.toAppUrl(propertyRep.value().link().href());
                    propertyViewModel.reference = propertyRep.isScalar() || propertyRep.value().isNull() ? "" : propertyRep.value().link().href();
                    propertyViewModel.doClick = function () {
                        urlManager.setProperty(propertyRep);
                    };
                    if (propertyRep.attachmentLink() != null) {
                        propertyViewModel.attachment = Modern.AttachmentViewModel.create(propertyRep.attachmentLink().href(), propertyRep.attachmentLink().type().asString, propertyRep.attachmentLink().title());
                    }
                    // only set color if has value 
                    propertyViewModel.color = propertyViewModel.value ? color.toColorFromType(propertyRep.extensions().returnType) : "";
                    propertyViewModel.id = id;
                    propertyViewModel.argId = id.toLowerCase();
                    propertyViewModel.isEditable = !propertyRep.disabledReason();
                    propertyViewModel.choices = [];
                    propertyViewModel.hasPrompt = propertyRep.hasPrompt();
                    if (propertyRep.hasChoices()) {
                        var choices = propertyRep.choices();
                        if (choices) {
                            propertyViewModel.choices = _.map(choices, function (v, n) {
                                return Modern.ChoiceViewModel.create(v, id, n);
                            });
                        }
                    }
                    propertyViewModel.hasChoices = propertyViewModel.choices.length > 0;
                    propertyViewModel.hasPrompt = !!propertyRep.promptLink() && propertyRep.promptLink().arguments()["x-ro-searchTerm"];
                    propertyViewModel.hasConditionalChoices = !!propertyRep.promptLink() && !propertyViewModel.hasPrompt;
                    if (propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {
                        var promptRep = propertyRep.getPrompts();
                        if (propertyViewModel.hasPrompt) {
                            propertyViewModel.prompt = _.partial(context.prompt, promptRep, id);
                            propertyViewModel.minLength = propertyRep.promptLink().extensions().minLength;
                        }
                        if (propertyViewModel.hasConditionalChoices) {
                            propertyViewModel.conditionalChoices = _.partial(context.conditionalChoices, promptRep, id);
                            propertyViewModel.arguments = _.object(_.map(propertyRep.promptLink().arguments(), function (v, key) { return [key, new Spiro.Value(v.value)]; }));
                        }
                    }
                    if (propertyViewModel.hasChoices || propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {
                        var currentChoice = Modern.ChoiceViewModel.create(propertyRep.value(), id);
                        if (propertyViewModel.hasPrompt || propertyViewModel.hasConditionalChoices) {
                            propertyViewModel.choice = currentChoice;
                        }
                        else {
                            propertyViewModel.choice = _.find(propertyViewModel.choices, function (c) { return c.match(currentChoice); });
                        }
                    }
                    if (propertyRep.isScalar()) {
                        var remoteMask = propertyRep.extensions()["x-ro-nof-mask"];
                        var localFilter = mask.toLocalFilter(remoteMask) || mask.defaultLocalFilter(propertyRep.extensions().format);
                        if (localFilter) {
                            propertyViewModel.value = $filter(localFilter.name)(propertyViewModel.value, localFilter.mask);
                        }
                    }
                    // if a reference and no way to set (ie not choices or autocomplete) use autoautocomplete
                    if (propertyViewModel.type === "ref" && !propertyViewModel.hasPrompt && !propertyViewModel.hasChoices && !propertyViewModel.hasConditionalChoices) {
                        addAutoAutoComplete(propertyViewModel, Modern.ChoiceViewModel.create(propertyRep.value(), id), id, propertyRep.value());
                    }
                    return propertyViewModel;
                };
                function getItems(cvm, links, populateItems) {
                    if (populateItems) {
                        return _.map(links, function (link) {
                            var ivm = viewModelFactory.itemViewModel(link);
                            var tempTgt = link.getTarget();
                            repLoader.populate(tempTgt).
                                then(function (obj) {
                                ivm.target = viewModelFactory.domainObjectViewModel(obj, {});
                                if (!cvm.header) {
                                    cvm.header = _.map(ivm.target.properties, function (property) { return property.title; });
                                }
                            });
                            return ivm;
                        });
                    }
                    else {
                        return _.map(links, function (link) { return viewModelFactory.itemViewModel(link); });
                    }
                }
                function create(collectionRep, state) {
                    var collectionViewModel = new Modern.CollectionViewModel();
                    var links = collectionRep.value().models;
                    collectionViewModel.title = collectionRep.extensions().friendlyName;
                    collectionViewModel.size = links.length;
                    collectionViewModel.pluralName = collectionRep.extensions().pluralName;
                    collectionViewModel.color = color.toColorFromType(collectionRep.extensions().elementType);
                    collectionViewModel.items = getItems(collectionViewModel, links, state === Modern.CollectionViewState.Table);
                    switch (state) {
                        case Modern.CollectionViewState.List:
                            collectionViewModel.template = Angular.collectionListTemplate;
                            break;
                        case Modern.CollectionViewState.Table:
                            collectionViewModel.template = Angular.collectionTableTemplate;
                            break;
                        default:
                            collectionViewModel.template = Angular.collectionSummaryTemplate;
                    }
                    return collectionViewModel;
                }
                function createFromList(listRep, state) {
                    var collectionViewModel = new Modern.CollectionViewModel();
                    var links = listRep.value().models;
                    collectionViewModel.size = links.length;
                    collectionViewModel.pluralName = "Objects";
                    collectionViewModel.items = getItems(collectionViewModel, links, state === Modern.CollectionViewState.Table);
                    return collectionViewModel;
                }
                viewModelFactory.collectionViewModel = function (collection, state) {
                    var collectionVm = null;
                    if (collection instanceof Spiro.CollectionMember) {
                        collectionVm = create(collection, state);
                    }
                    if (collection instanceof Spiro.ListRepresentation) {
                        collectionVm = createFromList(collection, state);
                    }
                    if (collectionVm) {
                        collectionVm.doSummary = function () { return urlManager.setCollectionState(collection, Modern.CollectionViewState.Summary); };
                        collectionVm.doList = function () { return urlManager.setCollectionState(collection, Modern.CollectionViewState.List); };
                        collectionVm.doTable = function () { return urlManager.setCollectionState(collection, Modern.CollectionViewState.Table); };
                    }
                    return collectionVm;
                };
                viewModelFactory.servicesViewModel = function (servicesRep) {
                    var servicesViewModel = new Modern.ServicesViewModel();
                    // filter out contributed action services 
                    var links = _.filter(servicesRep.value().models, function (m) {
                        var sid = m.rel().parms[0].value;
                        return sid.indexOf("ContributedActions") === -1;
                    });
                    servicesViewModel.title = "Services";
                    servicesViewModel.color = "bg-color-darkBlue";
                    servicesViewModel.items = _.map(links, function (link) { return viewModelFactory.linkViewModel(link); });
                    return servicesViewModel;
                };
                viewModelFactory.menusViewModel = function (menusRep) {
                    var menusViewModel = new Modern.MenusViewModel();
                    menusViewModel.title = "Menus";
                    menusViewModel.color = "bg-color-darkBlue";
                    menusViewModel.items = _.map(menusRep.value().models, function (link) { return viewModelFactory.linkViewModel(link); });
                    return menusViewModel;
                };
                viewModelFactory.serviceViewModel = function (serviceRep) {
                    var serviceViewModel = new Modern.ServiceViewModel();
                    var actions = serviceRep.actionMembers();
                    serviceViewModel.serviceId = serviceRep.serviceId();
                    serviceViewModel.title = serviceRep.title();
                    serviceViewModel.actions = _.map(actions, function (action) { return viewModelFactory.actionViewModel(action); });
                    serviceViewModel.color = color.toColorFromType(serviceRep.serviceId());
                    return serviceViewModel;
                };
                viewModelFactory.domainObjectViewModel = function (objectRep, collectionStates, save, previousUrl) {
                    var objectViewModel = new Modern.DomainObjectViewModel();
                    objectViewModel.isTransient = !!objectRep.persistLink();
                    //objectViewModel.href = urlHelper.toNewAppUrl(objectRep.getUrl());
                    objectViewModel.color = color.toColorFromType(objectRep.domainType());
                    objectViewModel.doSave = save ? function () { return save(objectViewModel); } : function () { };
                    objectViewModel.doEdit = function () { return urlManager.setObjectEdit(true); };
                    objectViewModel.doEditCancel = objectViewModel.isTransient ? function () { navigation.back(); } : function () { return urlManager.setObjectEdit(false); };
                    var properties = objectRep.propertyMembers();
                    var collections = objectRep.collectionMembers();
                    var actions = objectRep.actionMembers();
                    objectViewModel.domainType = objectRep.domainType();
                    objectViewModel.title = objectViewModel.isTransient ? "Unsaved " + objectRep.extensions().friendlyName : objectRep.title();
                    objectViewModel.message = "";
                    objectViewModel.properties = _.map(properties, function (property, id) { return viewModelFactory.propertyViewModel(property, id); });
                    objectViewModel.collections = _.map(collections, function (collection) { return viewModelFactory.collectionViewModel(collection, collectionStates[collection.collectionId()]); });
                    objectViewModel.actions = _.map(actions, function (action, id) { return viewModelFactory.actionViewModel(action); });
                    objectViewModel.toggleActionMenu = function () {
                        urlManager.toggleObjectMenu();
                    };
                    return objectViewModel;
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.viewmodelfactory.js.map