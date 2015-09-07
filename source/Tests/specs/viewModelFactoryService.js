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
/// <reference path="../../Scripts/typings/jasmine/jasmine-1.3.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.models.ts" />
/// <reference path="../../Scripts/spiro.angular.services.color.ts" />
/// <reference path="../../Scripts/spiro.modern.viewmodels.ts" />
/// <reference path="helpers.ts" />
describe("viewModelFactory Service", function () {
    beforeEach(module("app"));
    describe("create errorViewModel", function () {
        var resultVm;
        var rawError = { message: "a message", stackTrace: ["line1", "line2"] };
        var emptyError = {};
        describe("from populated rep", function () {
            beforeEach(inject(function (viewModelFactory) {
                resultVm = viewModelFactory.errorViewModel(new Spiro.ErrorRepresentation(rawError));
            }));
            it("creates a error view model", function () {
                expect(resultVm.message).toBe("a message");
                expect(resultVm.stackTrace.length).toBe(2);
                expect(resultVm.stackTrace.pop()).toBe("line2");
                expect(resultVm.stackTrace.pop()).toBe("line1");
            });
        });
        describe("from empty rep", function () {
            beforeEach(inject(function (viewModelFactory) {
                resultVm = viewModelFactory.errorViewModel(new Spiro.ErrorRepresentation(emptyError));
            }));
            it("creates a error view model", function () {
                expect(resultVm.message).toBe("An Error occurred");
                expect(resultVm.stackTrace.length).toBe(1);
                expect(resultVm.stackTrace.pop()).toBe("Empty");
            });
        });
    });
    describe("create linkViewModel", function () {
        var resultVm;
        var rawLink = {
            title: "a title",
            href: "http://objects/AdventureWorksModel.Product/1",
            rel: 'urn: org.restfulobjects:rels/details;action="anAction"'
        };
        describe("from populated rep", function () {
            var setMenu;
            beforeEach(inject(function (viewModelFactory, urlManager) {
                resultVm = viewModelFactory.linkViewModel(new Spiro.Link(rawLink));
                setMenu = spyOn(urlManager, "setMenu");
            }));
            it("creates a link view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.color).toBe("bg-color-orangeDark");
                resultVm.doClick();
                expect(setMenu).toHaveBeenCalledWith("anAction");
            });
        });
    });
    describe("create itemViewModel", function () {
        var resultVm;
        var setItem;
        var rawLink = { title: "a title", href: "http://objects/AdventureWorksModel.Product/1" };
        describe("from populated rep", function () {
            var link = new Spiro.Link(rawLink);
            beforeEach(inject(function (viewModelFactory, urlManager) {
                resultVm = viewModelFactory.itemViewModel(link);
                setItem = spyOn(urlManager, "setItem");
            }));
            it("creates an item view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.color).toBe("bg-color-orangeDark");
                resultVm.doClick();
                expect(setItem).toHaveBeenCalledWith(link);
                expect(resultVm.target).toBeUndefined();
            });
        });
    });
    describe("create actionViewModel", function () {
        var resultVm;
        var rawdetailsLink = {
            rel: "urn:org.restfulobjects:rels/details",
            href: "http://objects/AdventureWorksModel.Product/1/actions/anaction"
        };
        var rawAction = {
            extensions: {
                friendlyName: "a title",
                "x-ro-nof-menuPath": "a path"
            },
            links: [rawdetailsLink]
        };
        var rawActionParms = _.set(_.cloneDeep(rawAction), "extensions.hasParams", true);
        describe("from populated rep with no parms", function () {
            var invokeAction;
            var am = new Spiro.ActionMember(rawAction, {}, "anid");
            beforeEach(inject(function (viewModelFactory, context) {
                resultVm = viewModelFactory.actionViewModel(am);
                invokeAction = spyOn(context, "invokeAction");
            }));
            it("creates an action view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.menuPath).toBe("a path");
                resultVm.doInvoke();
                expect(invokeAction).toHaveBeenCalledWith(am);
            });
        });
        describe("from populated rep with parms", function () {
            var setDialog;
            beforeEach(inject(function (viewModelFactory, urlManager) {
                resultVm = viewModelFactory.actionViewModel(new Spiro.ActionMember(rawActionParms, {}, "anid"));
                setDialog = spyOn(urlManager, "setDialog");
            }));
            it("creates an action view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.menuPath).toBe("a path");
                resultVm.doInvoke();
                expect(setDialog).toHaveBeenCalledWith("anid");
            });
        });
    });
    describe("create dialogViewModel", function () {
        var resultVm;
        var rawInvokeLink = {
            rel: "urn:org.restfulobjects:rels/invoke",
            href: "http://objects/AdventureWorksModel.Product/1/actions/anaction"
        };
        var rawUpLink = {
            rel: "urn:org.restfulobjects:rels/up",
            href: "http://objects/AdventureWorksModel.Product/1"
        };
        var rawAction = {
            extensions: { friendlyName: "a title" },
            links: [rawInvokeLink, rawUpLink]
        };
        describe("from simple rep", function () {
            var invokeAction;
            var closeDialog;
            var am = new Spiro.ActionMember(rawAction, {}, "anid");
            beforeEach(inject(function (viewModelFactory, context, urlManager) {
                invokeAction = spyOn(context, "invokeAction");
                closeDialog = spyOn(urlManager, "closeDialog");
                resultVm = viewModelFactory.dialogViewModel(am);
            }));
            it("creates a dialog view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.isQuery).toBe(false);
                expect(resultVm.message).toBe("");
                expect(resultVm.parameters.length).toBe(0);
                resultVm.doInvoke();
                expect(invokeAction).toHaveBeenCalledWith(am, resultVm);
                resultVm.doClose();
                expect(closeDialog).toHaveBeenCalled();
            });
        });
    });
    describe("create collectionViewModel", function () {
        var resultVm;
        var rawLink1 = {
            type: "application/json;profile=\"urn:org.resfulobjects:repr-types/object\"",
            href: "http://objects/AdventureWorksModel.Product/1"
        };
        var rawLink2 = {
            type: "application/json;profile=\"urn:org.resfulobjects:repr-types/object\"",
            href: "http://objects/AdventureWorksModel.Product/2"
        };
        var rawDetailsLink = {
            rel: "urn:org.restfulobjects:rels/details",
            href: "http://objects/AdventureWorksModel.Product/1/collections/acollection"
        };
        var rawSelfLink = {
            rel: "urn:org.restfulobjects:rels/self",
            href: "http://objects/AdventureWorksModel.Product/1/collections/acollection"
        };
        var rawEmptyCollection = {
            size: 0,
            extensions: {
                friendlyName: "a title",
                pluralName: "somethings",
                elementType: "AdventureWorksModel.Product"
            },
            links: [rawDetailsLink]
        };
        var rawEmptyList = {
            value: [],
            links: [rawSelfLink]
        };
        var rawCollection = {
            size: 2,
            extensions: {
                friendlyName: "a title",
                pluralName: "somethings",
                elementType: "AdventureWorksModel.Product"
            },
            links: [rawDetailsLink],
            value: [rawLink1, rawLink2]
        };
        var rawList = {
            value: [rawLink1, rawLink2],
            links: [rawSelfLink]
        };
        describe("from empty collection member rep", function () {
            var setCollectionState;
            var cm = new Spiro.CollectionMember(rawEmptyCollection, {}, "");
            beforeEach(inject(function (viewModelFactory, urlManager) {
                resultVm = viewModelFactory.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.List);
                setCollectionState = spyOn(urlManager, "setCollectionState");
            }));
            it("creates a dialog view model", function () {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.size).toBe(0);
                expect(resultVm.color).toBe("bg-color-orangeDark");
                expect(resultVm.items.length).toBe(0);
                expect(resultVm.pluralName).toBe("somethings");
                resultVm.doSummary();
                expect(setCollectionState).toHaveBeenCalledWith(cm, Spiro.Angular.Modern.CollectionViewState.Summary);
                resultVm.doList();
                expect(setCollectionState).toHaveBeenCalledWith(cm, Spiro.Angular.Modern.CollectionViewState.List);
                resultVm.doTable();
                expect(setCollectionState).toHaveBeenCalledWith(cm, Spiro.Angular.Modern.CollectionViewState.Table);
            });
        });
        describe("from non empty collection member rep", function () {
            var setCollectionState;
            var itemViewModel;
            var populate;
            var cm = new Spiro.CollectionMember(rawCollection, {}, "");
            var vmf;
            beforeEach(inject(function (viewModelFactory, urlManager, repLoader, $q) {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                itemViewModel = spyOn(viewModelFactory, "itemViewModel");
                populate = spyOn(repLoader, "populate").andReturn($q.when());
                vmf = viewModelFactory;
            }));
            it("creates a dialog view model with items", function () {
                resultVm = vmf.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.List);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate).not.toHaveBeenCalled();
            });
            it("it populates table items", function () {
                resultVm = vmf.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.Table);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate.callCount).toBe(2);
            });
        });
        describe("from empty list rep", function () {
            var setCollectionState;
            var lr = new Spiro.ListRepresentation(rawEmptyList);
            beforeEach(inject(function (viewModelFactory, urlManager) {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                resultVm = viewModelFactory.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.Summary);
            }));
            it("creates a dialog view model", function () {
                expect(resultVm.title).toBeUndefined();
                expect(resultVm.size).toBe(0);
                expect(resultVm.color).toBeUndefined();
                expect(resultVm.items.length).toBe(0);
                expect(resultVm.pluralName).toBe("Objects");
                resultVm.doSummary();
                expect(setCollectionState).toHaveBeenCalledWith(lr, Spiro.Angular.Modern.CollectionViewState.Summary);
                resultVm.doList();
                expect(setCollectionState).toHaveBeenCalledWith(lr, Spiro.Angular.Modern.CollectionViewState.List);
                resultVm.doTable();
                expect(setCollectionState).toHaveBeenCalledWith(lr, Spiro.Angular.Modern.CollectionViewState.Table);
            });
        });
        describe("from non empty list rep", function () {
            var setCollectionState;
            var itemViewModel;
            var populate;
            var lr = new Spiro.ListRepresentation(rawList);
            var vmf;
            beforeEach(inject(function (viewModelFactory, urlManager, repLoader, $q) {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                itemViewModel = spyOn(viewModelFactory, "itemViewModel");
                populate = spyOn(repLoader, "populate").andReturn($q.when());
                vmf = viewModelFactory;
            }));
            it("creates a dialog view model with items", function () {
                resultVm = vmf.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.List);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate).not.toHaveBeenCalled();
            });
            it("it populates table items", function () {
                resultVm = vmf.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.Table);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate.callCount).toBe(2);
            });
        });
    });
    // updated to here
    describe("create object view model", function () {
        var resultVm;
        var rawSelfLink = { rel: "urn:org.restfulobjects:rels/self", href: "http://objects/AdventureWorksModel.Product/1" };
        var rawObject = { domainType: "an object", links: [rawSelfLink], title: "a title", extensions: { friendlyName: "a name" } };
        describe("from populated rep", function () {
            beforeEach(inject(function (viewModelFactory) {
                resultVm = viewModelFactory.domainObjectViewModel(new Spiro.DomainObjectRepresentation(rawObject), {});
            }));
            it("creates a object view model", function () {
                expect(resultVm.domainType).toBe("an object");
                expect(resultVm.title).toBe("a title");
                expect(resultVm.actions.length).toBe(0);
                expect(resultVm.properties.length).toBe(0);
                expect(resultVm.collections.length).toBe(0);
                expect(resultVm.color).toBe("bg-color-red");
                // expect(resultVm.cancelEdit).toBe("#/objects/AdventureWorksModel.Product/1");
            });
        });
        describe("from transient populated rep", function () {
            beforeEach(inject(function (viewModelFactory) {
                var rawPersistLink = { rel: "urn:org.restfulobjects:rels/persist", href: "http://objects/AdventureWorksModel.Product" };
                rawObject.links.pop();
                rawObject.links.push(rawPersistLink);
                var doRep = new Spiro.DomainObjectRepresentation(rawObject);
                doRep.hateoasUrl = "http://objects/AdventureWorksModel.Product";
                resultVm = viewModelFactory.domainObjectViewModel(doRep, {});
            }));
            it("creates a object view model", function () {
                expect(resultVm.domainType).toBe("an object");
                expect(resultVm.title).toBe("Unsaved a name");
                expect(resultVm.actions.length).toBe(0);
                expect(resultVm.properties.length).toBe(0);
                expect(resultVm.collections.length).toBe(0);
                expect(resultVm.color).toBe("bg-color-red");
                //expect(resultVm.cancelEdit).toBe("");
            });
        });
    });
    describe("create parameter view model", function () {
        var resultVm;
        var rawParameter = { extensions: { friendlyName: "a parm" }, links: [] };
        var rawAction = {};
        describe("from populated rep", function () {
            beforeEach(inject(function (viewModelFactory) {
                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anId"), "pv");
            }));
            it("creates a parameter view model", function () {
                expect(resultVm.type).toBe("ref");
                expect(resultVm.title).toBe("a parm");
                expect(resultVm.dflt).toBe("");
                expect(resultVm.message).toBe("");
                expect(resultVm.mask).toBeUndefined();
                expect(resultVm.id).toBe("anId");
                expect(resultVm.argId).toBe("anid");
                expect(resultVm.returnType).toBeUndefined();
                expect(resultVm.format).toBeUndefined();
                expect(resultVm.reference).toBe("");
                expect(resultVm.choices.length).toBe(0);
                expect(resultVm.hasChoices).toBe(false);
                expect(resultVm.hasPrompt).toBe(false);
                expect(resultVm.hasConditionalChoices).toBe(false);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.value).toBe("pv");
            });
        });
        describe("from populated rep with scalar choices", function () {
            beforeEach(inject(function (viewModelFactory) {
                rawParameter.choices = [1, 2, 3];
                rawParameter.default = 1;
                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anid"), "");
            }));
            it("creates a parameter view model with choices", function () {
                expect(resultVm.choices.length).toBe(3);
                expect(resultVm.hasChoices).toBe(true);
                expect(resultVm.hasPrompt).toBe(false);
                expect(resultVm.hasConditionalChoices).toBe(false);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.choice.value).toBe("1");
                expect(resultVm.value).toBeUndefined();
            });
        });
        describe("from populated rep with prompt autocomplete", function () {
            beforeEach(inject(function (viewModelFactory) {
                var rawPromptLink = {
                    rel: "urn:org.restfulobjects:rels/prompt",
                    href: "http://services/AdventureWorksModel.ProductRepository/prompt",
                    arguments: { "x-ro-searchTerm": { value: null } },
                    extensions: { minLength: 0 },
                    type: "application/json; profile = \"urn:org.restfulobjects:repr-types/prompt\""
                };
                rawParameter.choices = null;
                rawParameter.default = 1;
                rawParameter.links.push(rawPromptLink);
                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anid"), "");
            }));
            it("creates a parameter view model with prompt", function () {
                expect(resultVm.choices.length).toBe(0);
                expect(resultVm.hasChoices).toBe(false);
                expect(resultVm.hasPrompt).toBe(true);
                expect(resultVm.hasConditionalChoices).toBe(false);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.choice.value).toBe("1");
                expect(resultVm.value).toBeUndefined();
            });
        });
        describe("from populated rep with prompt conditional choices", function () {
            beforeEach(inject(function (viewModelFactory) {
                var rawPromptLink = {
                    rel: "urn:org.restfulobjects:rels/prompt",
                    href: "http://services/AdventureWorksModel.ProductRepository/prompt",
                    arguments: { "parm": { value: null } },
                    extensions: { minLength: 0 },
                    type: "application/json; profile = \"urn:org.restfulobjects:repr-types/prompt\""
                };
                rawParameter.choices = null;
                rawParameter.default = 1;
                rawParameter.links.pop();
                rawParameter.links.push(rawPromptLink);
                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anid"), "");
            }));
            it("creates a parameter view model with prompt", function () {
                expect(resultVm.choices.length).toBe(0);
                expect(resultVm.hasChoices).toBe(false);
                expect(resultVm.hasPrompt).toBe(false);
                expect(resultVm.hasConditionalChoices).toBe(true);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.choice.value).toBe("1");
                expect(resultVm.value).toBeUndefined();
            });
        });
    });
});
//# sourceMappingURL=viewModelFactoryService.js.map