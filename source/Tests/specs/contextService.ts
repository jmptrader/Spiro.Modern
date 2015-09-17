////Copyright 2014 Stef Cascarini, Dan Haywood, Richard Pawson
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

/// <reference path="../../Scripts/typings/karma-jasmine/karma-jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../Scripts/spiro.modern.services.handlers.ts" />
/// <reference path="../../Scripts/spiro.modern.viewmodels.ts" />
/// <reference path="helpers.ts" />

describe("context Service", () => {

    beforeEach(module("app"));

    describe("getHome", () => {
        const testHome = new Spiro.HomePageRepresentation();
        let localContext: Spiro.Angular.Modern.IContext;
        let result: angular.IPromise<Spiro.HomePageRepresentation>;
        let populate: jasmine.Spy;
        let timeout: ng.ITimeoutService;


        beforeEach(inject(($q, $timeout, $rootScope, $routeParams, context, repLoader) => {
            localContext = context;
            timeout = $timeout;

            populate = spyOn(repLoader, "populate");
            populate.and.returnValue($q.when(testHome));
        }));

        describe("populates Home rep", () => {

            beforeEach(inject(() => {
                result = localContext.getHome();
            }));

            it("returns home representation", () => {
                expect(populate).toHaveBeenCalled();
                result.then((hr) => expect(hr).toBe(testHome));
                timeout.flush();
            });
        });
    });

    describe("getVersion", () => {
        const testVersion = new Spiro.VersionRepresentation();
        const testHome = new Spiro.HomePageRepresentation();
        let localContext: Spiro.Angular.Modern.IContext;
        let result: angular.IPromise<Spiro.VersionRepresentation>;
        let populate: jasmine.Spy;
        let getHome: jasmine.Spy;
        let getVersion: jasmine.Spy;
        let timeout: ng.ITimeoutService;

        beforeEach(inject(($q, $timeout, $rootScope, $routeParams, context, repLoader) => {
            localContext = context;
            timeout = $timeout;

            populate = spyOn(repLoader, "populate");
            populate.and.returnValue($q.when(testVersion));
            getHome = spyOn(context, "getHome");
            getHome.and.returnValue($q.when(testHome));
            getVersion = spyOn(testHome, "getVersion");
            getVersion.and.returnValue(testVersion);
        }));

        describe("populates Version rep", () => {

            beforeEach(inject(() => {
                result = localContext.getVersion();
                timeout.flush();
            }));

            it("returns version representation", () => {
                expect(populate).toHaveBeenCalled();
                result.then((hr) => expect(hr).toBe(testVersion));
                timeout.flush();
            });
        });
    });

    describe("getMenus", () => {
        const testMenus = new Spiro.MenusRepresentation();
        const testHome = new Spiro.HomePageRepresentation();
        let localContext: Spiro.Angular.Modern.IContext;
        let result: angular.IPromise<Spiro.MenusRepresentation>;
        let populate: jasmine.Spy;
        let getHome: jasmine.Spy;
        let getMenus: jasmine.Spy;
        let timeout: ng.ITimeoutService;

        beforeEach(inject(($q, $timeout, $rootScope, $routeParams, context, repLoader) => {
            localContext = context;
            timeout = $timeout;

            populate = spyOn(repLoader, "populate");
            populate.and.returnValue($q.when(testMenus));
            getHome = spyOn(context, "getHome");
            getHome.and.returnValue($q.when(testHome));
            getMenus = spyOn(testHome, "getMenus");
            getMenus.and.returnValue(testMenus);

        }));

        describe("populates menus rep", () => {

            beforeEach(inject(() => {
                result = localContext.getMenus();
                timeout.flush();
            }));

            it("returns menus representation", () => {
                expect(getHome).toHaveBeenCalled();
                expect(getMenus).toHaveBeenCalled();
                expect(populate).toHaveBeenCalled();
                result.then((hr) => expect(hr).toBe(testMenus));
                timeout.flush();
            });
        });
    });

    describe("getMenu", () => {
        const testMenu = new Spiro.MenuRepresentation();
        const testMenus = new Spiro.MenusRepresentation();

        let localContext: Spiro.Angular.Modern.IContext;
        let result: angular.IPromise<Spiro.MenuRepresentation>;
        let populate: jasmine.Spy;
        let getMenus: jasmine.Spy;
        let getMenu: jasmine.Spy;
        let timeout: ng.ITimeoutService;

        beforeEach(inject(($q, $timeout, $rootScope, $routeParams, context, repLoader) => {
            localContext = context;
            timeout = $timeout;

            populate = spyOn(repLoader, "populate");
            populate.and.returnValue($q.when(testMenu));

            getMenus = spyOn(context, "getMenus");
            getMenus.and.returnValue($q.when(testMenus));
            getMenu = spyOn(testMenus, "getMenu");
            getMenu.and.returnValue(testMenu);
        }));

        describe("populates menu rep", () => {

            beforeEach(inject(() => {
                result = localContext.getMenu("anId");
                timeout.flush();
            }));

            it("returns menu representation", () => {
                expect(getMenus).toHaveBeenCalled();
                expect(getMenu).toHaveBeenCalledWith("anId");
                expect(populate).toHaveBeenCalled();
                result.then((hr) => expect(hr).toBe(testMenu));
                timeout.flush();
            });
        });
    });

    describe("getObject", () => {

        const testObject = new Spiro.DomainObjectRepresentation();

        let localContext: Spiro.Angular.Modern.IContext;
        let result: angular.IPromise<Spiro.DomainObjectRepresentation>;
        let getDomainObject: jasmine.Spy;
        let getService: jasmine.Spy;
        let populate: jasmine.Spy;
        let timeout: ng.ITimeoutService;

        describe("getting a domain object", () => {

            beforeEach(inject(($q, $rootScope, $routeParams, $timeout, context, repLoader) => {
                populate = spyOn(repLoader, "populate");
                populate.and.returnValue($q.when(testObject));

                getDomainObject = spyOn(context, "getDomainObject");
                getDomainObject.and.callThrough();

                getService = spyOn(context, "getService");
                getService.and.callThrough();

                spyOn(testObject, "domainType").and.returnValue("test");
                spyOn(testObject, "instanceId").and.returnValue("1");
                spyOn(testObject, "serviceId").and.returnValue(undefined);

                localContext = context;
                timeout = $timeout;
            }));

            describe("when currentObject is set", () => {

                beforeEach(inject(() => {
                    (<any> localContext).setObject(testObject);
                    result = localContext.getObject("test", ["1"]);
                    timeout.flush();
                }));


                it("returns object representation", () => {
                    expect(getDomainObject).toHaveBeenCalledWith("test", "1");
                    expect(getService).not.toHaveBeenCalled();
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });

            describe("when currentObject is set but not same", () => {


                beforeEach(inject(() => {

                    (<any> localContext).setObject(testObject);
                    result = localContext.getObject("test2", ["2"]);
                    timeout.flush();
                }));


                it("returns object representation", () => {
                    expect(populate).toHaveBeenCalled();
                    expect(getDomainObject).toHaveBeenCalledWith("test2", "2");
                    expect(getService).not.toHaveBeenCalled();
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });


            describe("when currentObject is not set", () => {

                beforeEach(inject(() => {

                    result = localContext.getObject("test", ["1"]);
                    timeout.flush();
                }));


                it("returns object representation", () => {
                    expect(populate).toHaveBeenCalled();
                    expect(getDomainObject).toHaveBeenCalledWith("test", "1");
                    expect(getService).not.toHaveBeenCalled();
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });
        });

        describe("getting a service", () => {

            const testServices = new Spiro.DomainServicesRepresentation();
            let getServices: jasmine.Spy;
            let getServiceRep: jasmine.Spy;

            beforeEach(inject(($q, $rootScope, $routeParams, $timeout, context, repLoader) => {
                populate = spyOn(repLoader, "populate");
                populate.and.returnValue($q.when(testObject));

                getDomainObject = spyOn(context, "getDomainObject");
                getDomainObject.and.callThrough();

                getService = spyOn(context, "getService");
                getService.and.callThrough();

                getServices = spyOn(context, "getServices");
                getServices.and.returnValue($q.when(testServices));

                getServiceRep = spyOn(testServices, "getService");
                getServiceRep.and.returnValue(testObject);

                spyOn(testObject, "domainType").and.returnValue("test");
                spyOn(testObject, "instanceId").and.returnValue(undefined);
                spyOn(testObject, "serviceId").and.returnValue("sid");

                localContext = context;
                timeout = $timeout;
            }));

            describe("when currentObject is set", () => {

                beforeEach(inject(() => {
                    (<any> localContext).setObject(testObject);
                    result = localContext.getObject("test");
                    timeout.flush();
                }));


                it("returns service representation", () => {
                    expect(getDomainObject).not.toHaveBeenCalled();
                    expect(getService).toHaveBeenCalledWith("test");
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });

            describe("when currentObject is set but not same", () => {


                beforeEach(inject(() => {

                    (<any> localContext).setObject(testObject);
                    result = localContext.getObject("test2");
                    timeout.flush();
                }));


                it("returns service representation", () => {
                    expect(populate).toHaveBeenCalled();
                    expect(getDomainObject).not.toHaveBeenCalled();
                    expect(getService).toHaveBeenCalledWith("test2");
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });


            describe("when currentObject is not set", () => {

                beforeEach(inject(() => {

                    result = localContext.getObject("test");
                    timeout.flush();
                }));


                it("returns service representation", () => {
                    expect(populate).toHaveBeenCalled();
                    expect(getDomainObject).not.toHaveBeenCalled();
                    expect(getService).toHaveBeenCalledWith("test");
                    result.then((hr) => expect(hr).toBe(testObject));
                    timeout.flush();
                });
            });
        });


    });


    //describe("getQuery", () => {

    //    const testObject = new Spiro.ListRepresentation();
    //    let localContext: Spiro.Angular.Modern.IContext;
    //    let result: angular.IPromise<Spiro.ListRepresentation>;
    //    let timeout: ng.ITimeoutService;

    //    beforeEach(inject(($rootScope, $routeParams, $timeout, context) => {
    //        localContext = context;
    //        timeout = $timeout;
    //    }));

    //    describe("when collection is set", () => {

    //        beforeEach(inject(() => {

    //            (<any>localContext).setQuery(testObject);

    //            result = localContext.getQuery("", "", []);
    //            timeout.flush();
    //        }));

    //        it("returns collection representation", () => {
    //            expect(result).toBe(testObject);
    //        });
    //    });

    //    describe("when collection is not set", () => {

    //        beforeEach(inject(() => {
    //            result = localContext.getQuery("", "", []);
    //            timeout.flush();
    //        }));

    //        it("returns object representation", () => {
    //            expect(result).toBeNull();
    //        });
    //    });

    //});




    describe("getSelectedChoice", () => {

        let localContext: Spiro.Angular.Modern.IContext;
        let result: Spiro.Angular.Modern.ChoiceViewModel[];
        let timeout: ng.ITimeoutService;

        beforeEach(inject(($rootScope, $routeParams, $timeout, context) => {
            localContext = context;
            timeout = $timeout;
        }));


        describe("when selected choice is not set", () => {

            beforeEach(inject(() => {
                result = localContext.getSelectedChoice("test", "test");
            }));

            it("returns empty collection", () => {
                expect(result.length).toBe(0);
            });
        });

        describe("when selected choice is set", () => {

            const testCvm = new Spiro.Angular.Modern.ChoiceViewModel();

            beforeEach(inject(() => {

                localContext.setSelectedChoice("test1", "test2", testCvm);

                result = localContext.getSelectedChoice("test1", "test2");
            }));

            it("returns cvm array", () => {
                expect(result.length).toBe(1);
                expect(result.pop()).toBe(testCvm);
            });
        });

        describe("when multiple selected choices are set", () => {

            const testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
            const testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();

            beforeEach(inject(() => {

                localContext.setSelectedChoice("test3", "test4", testCvm1);
                localContext.setSelectedChoice("test3", "test4", testCvm2);
                result = localContext.getSelectedChoice("test3", "test4");
            }));

            it("returns cvm array", () => {
                expect(result.length).toBe(2);
                expect(result.pop()).toBe(testCvm2);
                expect(result.pop()).toBe(testCvm1);
            });
        });

        describe("when match parm but not search", () => {

            const testCvm = new Spiro.Angular.Modern.ChoiceViewModel();

            beforeEach(inject(() => {

                localContext.setSelectedChoice("test5", "test6", testCvm);
                result = localContext.getSelectedChoice("test5", "test7");
            }));

            it("returns undefined", () => {
                expect(result).toBeUndefined();
            });
        });

        describe("when multiple selected choices are set for a parm", () => {

            const testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
            const testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();

            let result1: Spiro.Angular.Modern.ChoiceViewModel[];

            beforeEach(inject(() => {

                localContext.setSelectedChoice("test6", "test8", testCvm1);
                localContext.setSelectedChoice("test6", "test9", testCvm2);

                result = localContext.getSelectedChoice("test6", "test8");
                result1 = localContext.getSelectedChoice("test6", "test9");
            }));

            it("returns cvm arrays", () => {
                expect(result.length).toBe(1);
                expect(result1.length).toBe(1);
                expect(result.pop()).toBe(testCvm1);
                expect(result1.pop()).toBe(testCvm2);
            });
        });


    });

});