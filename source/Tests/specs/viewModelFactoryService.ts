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

describe("viewModelFactory Service", () => {

    beforeEach(module("app"));

    describe("create errorViewModel", () => {

        let resultVm: Spiro.Angular.Modern.ErrorViewModel;
        const rawError = { message: "a message", stackTrace: ["line1", "line2"] };
        const emptyError = {};

        describe("from populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.errorViewModel(new Spiro.ErrorRepresentation(rawError));
            }));

            it("creates a error view model", () => {
                expect(resultVm.message).toBe("a message");
                expect(resultVm.stackTrace.length).toBe(2);
                expect(resultVm.stackTrace.pop()).toBe("line2");
                expect(resultVm.stackTrace.pop()).toBe("line1");
            });
        });

        describe("from empty rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.errorViewModel(new Spiro.ErrorRepresentation(emptyError));
            }));

            it("creates a error view model", () => {
                expect(resultVm.message).toBe("An Error occurred");
                expect(resultVm.stackTrace.length).toBe(1);
                expect(resultVm.stackTrace.pop()).toBe("Empty");
            });
        });
    });

    describe("create linkViewModel", () => {

        let resultVm: Spiro.Angular.Modern.LinkViewModel;
        const rawLink = {
            title: "a title",
            href: "http://objects/AdventureWorksModel.Product/1",
            rel: 'urn: org.restfulobjects:rels/details;action="anAction"'
        };

        describe("from populated rep", () => {

            let setMenu: jasmine.Spy;

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory, urlManager: Spiro.Angular.Modern.IUrlManager) => {
                resultVm = viewModelFactory.linkViewModel(new Spiro.Link(rawLink));
                setMenu = spyOn(urlManager, "setMenu");
            }));

            it("creates a link view model", () => {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.color).toBe("bg-color-orangeDark");
                resultVm.doClick();
                expect(setMenu).toHaveBeenCalledWith("anAction");
            });
        });
    });

    describe("create itemViewModel", () => {

        let resultVm: Spiro.Angular.Modern.ItemViewModel;
        let setItem: jasmine.Spy;
        const rawLink = { title: "a title", href: "http://objects/AdventureWorksModel.Product/1" };


        describe("from populated rep", () => {

            let link = new Spiro.Link(rawLink)

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory, urlManager: Spiro.Angular.Modern.IUrlManager) => {
                resultVm = viewModelFactory.itemViewModel(link);
                setItem = spyOn(urlManager, "setItem");
            }));

            it("creates an item view model", () => {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.color).toBe("bg-color-orangeDark");
                resultVm.doClick();
                expect(setItem).toHaveBeenCalledWith(link);
                expect(resultVm.target).toBeUndefined();
            });
        });



    });

    describe("create actionViewModel", () => {

        let resultVm: Spiro.Angular.Modern.ActionViewModel;
        const rawdetailsLink = {
            rel: "urn:org.restfulobjects:rels/details",
            href: "http://objects/AdventureWorksModel.Product/1/actions/anaction"
        }
        const rawAction = {
            extensions: {
                friendlyName: "a title",
                "x-ro-nof-menuPath": "a path"
            },
            links: [rawdetailsLink]
        };
        const rawActionParms = _.set(_.cloneDeep(rawAction), "extensions.hasParams", true);

        describe("from populated rep with no parms", () => {

            let invokeAction: jasmine.Spy;
            const am = new Spiro.ActionMember(rawAction, {}, "anid");

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory, context: Spiro.Angular.Modern.IContext) => {
                resultVm = viewModelFactory.actionViewModel(am);
                invokeAction = spyOn(context, "invokeAction");
            }));

            it("creates an action view model", () => {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.menuPath).toBe("a path");
                resultVm.doInvoke();
                expect(invokeAction).toHaveBeenCalledWith(am);
            });
        });

        describe("from populated rep with parms", () => {

            let setDialog: jasmine.Spy;

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory, urlManager: Spiro.Angular.Modern.IUrlManager) => {
                resultVm = viewModelFactory.actionViewModel(new Spiro.ActionMember(rawActionParms, {}, "anid"));
                setDialog = spyOn(urlManager, "setDialog");
            }));

            it("creates an action view model", () => {
                expect(resultVm.title).toBe("a title");
                expect(resultVm.menuPath).toBe("a path");
                resultVm.doInvoke();
                expect(setDialog).toHaveBeenCalledWith("anid");
            });
        });
    });

    describe("create dialogViewModel", () => {

        let resultVm: Spiro.Angular.Modern.DialogViewModel;

        const rawInvokeLink = {
            rel: "urn:org.restfulobjects:rels/invoke",
            href: "http://objects/AdventureWorksModel.Product/1/actions/anaction"
        };
        const rawUpLink = {
            rel: "urn:org.restfulobjects:rels/up",
            href: "http://objects/AdventureWorksModel.Product/1"
        };
        const rawAction = {
            extensions: { friendlyName: "a title" },
            links: [rawInvokeLink, rawUpLink]
        };

        describe("from simple rep", () => {

            let invokeAction: jasmine.Spy;
            let closeDialog: jasmine.Spy;
            const am = new Spiro.ActionMember(rawAction, {}, "anid");

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory, context: Spiro.Angular.Modern.IContext, urlManager: Spiro.Angular.Modern.IUrlManager) => {
                invokeAction = spyOn(context, "invokeAction");
                closeDialog = spyOn(urlManager, "closeDialog");
                resultVm = viewModelFactory.dialogViewModel(am);
            }));

            it("creates a dialog view model", () => {
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

    describe("create collectionViewModel", () => {

        let resultVm: Spiro.Angular.Modern.CollectionViewModel;

        const rawLink1 = {     
            type : "application/json;profile=\"urn:org.resfulobjects:repr-types/object\"",  
            href: "http://objects/AdventureWorksModel.Product/1"
        };

        const rawLink2 = {     
            type: "application/json;profile=\"urn:org.resfulobjects:repr-types/object\"",  
            href: "http://objects/AdventureWorksModel.Product/2"
        };


        const rawDetailsLink = {
            rel: "urn:org.restfulobjects:rels/details",
            href: "http://objects/AdventureWorksModel.Product/1/collections/acollection"
        };


        const rawSelfLink = {
            rel: "urn:org.restfulobjects:rels/self",
            href: "http://objects/AdventureWorksModel.Product/1/collections/acollection"
        };

        const rawEmptyCollection = {
            size: 0,
            extensions: {
                friendlyName: "a title",
                pluralName: "somethings",
                elementType: "AdventureWorksModel.Product"
            },
            links: [rawDetailsLink]
        };

        const rawEmptyList = {
            value: [],
            links: [rawSelfLink]
        };

        const rawCollection = {
            size: 2,
            extensions: {
                friendlyName: "a title",
                pluralName: "somethings",
                elementType: "AdventureWorksModel.Product"
            },
            links: [rawDetailsLink],
            value : [rawLink1, rawLink2]
        };

        const rawList = {
            value: [rawLink1, rawLink2],
            links: [rawSelfLink]
        };


        describe("from empty collection member rep", () => {

            let setCollectionState: jasmine.Spy;
            const cm = new Spiro.CollectionMember(rawEmptyCollection, {}, "");

            beforeEach(inject((viewModelFactory, urlManager) => {
                resultVm = viewModelFactory.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.List);

                setCollectionState = spyOn(urlManager, "setCollectionState");
            }));

            it("creates a dialog view model", () => {
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

        describe("from non empty collection member rep", () => {

            let setCollectionState: jasmine.Spy;
            let itemViewModel: jasmine.Spy;
            let populate: jasmine.Spy;

            const cm = new Spiro.CollectionMember(rawCollection, {}, "");
            let vmf: Spiro.Angular.Modern.IViewModelFactory;
          
            beforeEach(inject((viewModelFactory, urlManager, repLoader, $q) => {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                itemViewModel = spyOn(viewModelFactory, "itemViewModel");
                populate = spyOn(repLoader, "populate").andReturn($q.when());
                vmf = viewModelFactory;                 
            }));

            it("creates a dialog view model with items", () => {  
                resultVm = vmf.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.List);                    
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate).not.toHaveBeenCalled();
            });

            it("it populates table items", () => {
                resultVm = vmf.collectionViewModel(cm, Spiro.Angular.Modern.CollectionViewState.Table);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate.callCount).toBe(2);
            });
        });

        describe("from empty list rep", () => {

            let setCollectionState: jasmine.Spy;
            const lr = new Spiro.ListRepresentation(rawEmptyList);

            beforeEach(inject((viewModelFactory, urlManager) => {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                resultVm = viewModelFactory.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.Summary);
            }));

            it("creates a dialog view model", () => {
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

        describe("from non empty list rep", () => {

            let setCollectionState: jasmine.Spy;
            let itemViewModel: jasmine.Spy;
            let populate: jasmine.Spy;
            const lr = new Spiro.ListRepresentation(rawList);
            let vmf: Spiro.Angular.Modern.IViewModelFactory;
         

            beforeEach(inject((viewModelFactory, urlManager, repLoader, $q) => {
                setCollectionState = spyOn(urlManager, "setCollectionState");
                itemViewModel = spyOn(viewModelFactory, "itemViewModel");
                populate = spyOn(repLoader, "populate").andReturn($q.when());
                vmf = viewModelFactory;
            }));

            it("creates a dialog view model with items", () => {
                resultVm = vmf.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.List);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate).not.toHaveBeenCalled();
            });

            it("it populates table items", () => {
                resultVm = vmf.collectionViewModel(lr, Spiro.Angular.Modern.CollectionViewState.Table);
                expect(resultVm.items.length).toBe(2);
                expect(itemViewModel.callCount).toBe(2);
                expect(populate.callCount).toBe(2);
            });
        });
    });

     // updated to here

    describe("create services view model", () => {
        let resultVm: Spiro.Angular.Modern.ServicesViewModel;
        const rawServices = { value: [] };


        describe("from populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.servicesViewModel(new Spiro.DomainServicesRepresentation(rawServices));
            }));

            it("creates a services view model", () => {
                expect(resultVm.title).toBe("Services");
                expect(resultVm.color).toBe("bg-color-darkBlue");
                expect(resultVm.items.length).toBe(0);
            });
        });

    });

    describe("create service view model", () => {
        let resultVm: Spiro.Angular.Modern.ServiceViewModel;
        const rawSelfLink = { rel: "urn:org.restfulobjects:rels/self", href: "http://services/AdventureWorksModel.ProductRepository" };

        const rawService = { serviceId: "a service", value: [], links: [rawSelfLink], title: "a title" };

        describe("from populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.serviceViewModel(new Spiro.DomainObjectRepresentation(rawService));
            }));

            it("creates a service view model", () => {
                expect(resultVm.serviceId).toBe("a service");
                expect(resultVm.title).toBe("a title");
                expect(resultVm.actions.length).toBe(0);
                expect(resultVm.color).toBe("bg-color-greenLight");

            });
        });
    });

    describe("create object view model", () => {
        let resultVm: Spiro.Angular.Modern.DomainObjectViewModel;
        const rawSelfLink = { rel: "urn:org.restfulobjects:rels/self", href: "http://objects/AdventureWorksModel.Product/1" };

        const rawObject = { domainType: "an object", links: [rawSelfLink], title: "a title", extensions: { friendlyName: "a name" } };

        describe("from populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.domainObjectViewModel(new Spiro.DomainObjectRepresentation(rawObject), {});
            }));

            it("creates a object view model", () => {
                expect(resultVm.domainType).toBe("an object");
                expect(resultVm.title).toBe("a title");
                expect(resultVm.actions.length).toBe(0);
                expect(resultVm.properties.length).toBe(0);
                expect(resultVm.collections.length).toBe(0);
                expect(resultVm.color).toBe("bg-color-red");
                // expect(resultVm.cancelEdit).toBe("#/objects/AdventureWorksModel.Product/1");
            });
        });

        describe("from transient populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                const rawPersistLink = { rel: "urn:org.restfulobjects:rels/persist", href: "http://objects/AdventureWorksModel.Product" };
                rawObject.links.pop();
                rawObject.links.push(rawPersistLink);
                const doRep = new Spiro.DomainObjectRepresentation(rawObject);
                doRep.hateoasUrl = "http://objects/AdventureWorksModel.Product";

                resultVm = viewModelFactory.domainObjectViewModel(doRep, {});
            }));

            it("creates a object view model", () => {
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

    describe("create parameter view model", () => {
        let resultVm: Spiro.Angular.Modern.ParameterViewModel;

        const rawParameter: any = { extensions: { friendlyName: "a parm" }, links: [] };
        const rawAction = {};

        describe("from populated rep", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anId"), "pv");
            }));

            it("creates a parameter view model", () => {

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

        describe("from populated rep with scalar choices", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {

                rawParameter.choices = [1, 2, 3];
                rawParameter.default = 1;


                resultVm = viewModelFactory.parameterViewModel(new Spiro.Parameter(rawParameter, new Spiro.ActionRepresentation(rawAction), "anid"), "");
            }));

            it("creates a parameter view model with choices", () => {


                expect(resultVm.choices.length).toBe(3);
                expect(resultVm.hasChoices).toBe(true);
                expect(resultVm.hasPrompt).toBe(false);
                expect(resultVm.hasConditionalChoices).toBe(false);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.choice.value).toBe("1");
                expect(resultVm.value).toBeUndefined();

            });
        });

        describe("from populated rep with prompt autocomplete", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                const rawPromptLink = {
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

            it("creates a parameter view model with prompt", () => {


                expect(resultVm.choices.length).toBe(0);
                expect(resultVm.hasChoices).toBe(false);
                expect(resultVm.hasPrompt).toBe(true);
                expect(resultVm.hasConditionalChoices).toBe(false);
                expect(resultVm.isMultipleChoices).toBe(false);
                expect(resultVm.choice.value).toBe("1");
                expect(resultVm.value).toBeUndefined();

            });
        });

        describe("from populated rep with prompt conditional choices", () => {

            beforeEach(inject((viewModelFactory: Spiro.Angular.Modern.IViewModelFactory) => {
                const rawPromptLink = {
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

            it("creates a parameter view model with prompt", () => {


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
