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
        let localContext : Spiro.Angular.Modern.IContext;
        let result; 
        let populate: jasmine.Spy;
        let timeout;
        

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
        let result;
        let populate: jasmine.Spy;
        let getHome: jasmine.Spy;
        let getVersion: jasmine.Spy;
        let timeout;

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
        let result;
        let populate: jasmine.Spy;
        let getHome: jasmine.Spy;
        let getMenus: jasmine.Spy;
        let timeout;

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
        let result;
        let populate: jasmine.Spy;    
        let getMenus: jasmine.Spy;
        let getMenu: jasmine.Spy;
        let timeout;

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
        let result;
        let getDomainObject: jasmine.Spy;
        let getService: jasmine.Spy;
        let populate: jasmine.Spy;
        let timeout;

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

   

    //describe('getCollection', () => {

    //    var testObject = new Spiro.ListRepresentation();

    //    var localContext;
    //    var result;

    //    beforeEach(inject(($rootScope, $routeParams, context: Spiro.Angular.Modern.IContext) => {
    //        localContext = context;
    //    }));

    //    describe('when collection is set', () => {

    //        beforeEach(inject($rootScope => {

    //            localContext.setCollection(testObject);

    //            runs(() => {
    //                localContext.getCollection().then(object => {
    //                    result = object;
    //                });
    //                $rootScope.$apply();
    //            });

    //            waitsFor(() => !!result, "result not set", 1000);
    //        }));

    //        it('returns collection representation', () => {
    //            expect(result).toBe(testObject);
    //        });
    //    });

    //    describe('when collection is not set', () => {

    //        beforeEach(inject($rootScope => {

    //            var getCollectionRun = false;

    //            runs(() => {
    //                localContext.getCollection().then(object => {
    //                    result = object;
    //                    getCollectionRun = true;
    //                });
    //                $rootScope.$apply();
    //            });

    //            waitsFor(() => getCollectionRun, "result not set", 1000);
    //        }));

    //        it('returns object representation', () => {
    //            expect(result).toBeNull();
    //        });
    //    });

    //});

    //describe('getTransientObject', () => {

    //    var testObject = new Spiro.DomainObjectRepresentation();

    //    var localContext : Spiro.Angular.Modern.IContext;
    //    var result;

    //    beforeEach(inject(($rootScope, $routeParams, context: Spiro.Angular.Modern.IContext) => {
    //        localContext = context;
    //    }));

    //    //describe('when transient is set', () => {

    //    //    beforeEach(inject($rootScope => {

    //    //        localContext.setTransientObject(testObject);

    //    //        runs(() => {
    //    //            localContext.getTransientObject().then(object => {
    //    //                result = object;
    //    //            });
    //    //            $rootScope.$apply();
    //    //        });

    //    //        waitsFor(() => !!result, "result not set", 1000);
    //    //    }));

    //    //    it('returns transient representation', () => {
    //    //        expect(result).toBe(testObject);
    //    //    });
    //    //});

    //    //describe('when transient is not set', () => {

    //    //    beforeEach(inject($rootScope => {

    //    //        var getTransientRun = false;

    //    //        runs(() => {
    //    //            localContext.getCollection().then(object => {
    //    //                result = object;
    //    //                getTransientRun = true;
    //    //            });
    //    //            $rootScope.$apply();
    //    //        });

    //    //        waitsFor(() => getTransientRun, "result not set", 1000);
    //    //    }));

    //    //    it('returns object representation', () => {
    //    //        expect(result).toBeNull();
    //    //    });
    //    //});

    //});

    //describe('getService', () => {

    //    var testObject = new Spiro.DomainObjectRepresentation();

    //    var localContext;
    //    var result;

    //    var getDomainObject;
    //    var getService;

    //    beforeEach(inject(($rootScope, $routeParams, context: Spiro.Angular.Modern.IContext, repLoader: Spiro.Angular.IRepLoader) => {
    //        spyOnPromise(repLoader, 'populate', testObject);
    //        getDomainObject = spyOnPromise(context, 'getDomainObject', testObject);
    //        getService = spyOnPromise(context, 'getService', testObject);

    //        spyOn(testObject, 'domainType').and.returnValue(undefined);
    //        spyOn(testObject, 'instanceId').and.returnValue(undefined);
    //        spyOn(testObject, 'serviceId').and.returnValue("test");

    //        localContext = context;
    //    }));

    //    describe('when currentObject is set', () => {

    //        beforeEach(inject($rootScope => {

    //            localContext.setObject(testObject);

    //            runs(() => {
    //                localContext.getObject("test").then(object => {
    //                    result = object;
    //                });
    //                $rootScope.$apply();
    //            });

    //            waitsFor(() => !!result, "result not set", 1000);
    //        }));


    //        it('returns service representation', () => {
    //            expect(getDomainObject).not.toHaveBeenCalled();
    //            expect(getService).not.toHaveBeenCalled();
    //            expect(result).toBe(testObject);
    //        });
    //    });

    //    describe('when currentObject is set but is not same', () => {

    //        beforeEach(inject($rootScope => {

    //            localContext.setObject(testObject);

    //            runs(() => {
    //                localContext.getObject("test2").then(object => {
    //                    result = object;
    //                });
    //                $rootScope.$apply();
    //            });

    //            waitsFor(() => !!result, "result not set", 1000);
    //        }));


    //        it('returns service representation', () => {
    //            expect(getDomainObject).not.toHaveBeenCalled();
    //            expect(getService).toHaveBeenCalledWith("test2");
    //            expect(result).toBe(testObject);
    //        });
    //    });

    //    describe('when currentObject is not set', () => {

    //        beforeEach(inject($rootScope => {

    //            runs(() => {
    //                localContext.getObject("test").then(object => {
    //                    result = object;
    //                });
    //                $rootScope.$apply();
    //            });

    //            waitsFor(() => !!result, "result not set", 1000);
    //        }));


    //        it('returns service representation', () => {
    //            expect(getDomainObject).not.toHaveBeenCalled();
    //            expect(getService).toHaveBeenCalledWith("test");
    //            expect(result).toBe(testObject);
    //        });
    //    });

    //});

    //describe('getSelectedChoice', () => {

    //    var localContext: Spiro.Angular.Modern.IContext;
    //    var result: Spiro.Angular.Modern.ChoiceViewModel[];

    //    beforeEach(inject(($rootScope, $routeParams, context: Spiro.Angular.Modern.IContext) => {       
    //        localContext = context;
    //    }));

     
    //    describe('when selected choice is not set', () => {

    //        beforeEach(inject($rootScope => {
    //            runs(() => {
    //                result = localContext.getSelectedChoice("test", "test");
    //                $rootScope.$apply();
    //            });
    //        }));

    //        it('returns empty collection', () => {
    //            expect(result.length).toBe(0);
    //        });
    //    });

    //    describe('when selected choice is set', () => {

    //        var testCvm = new Spiro.Angular.Modern.ChoiceViewModel();

    //        beforeEach(inject($rootScope => {

    //            localContext.setSelectedChoice("test1", "test2", testCvm);

    //            runs(() => {
    //                result = localContext.getSelectedChoice("test1", "test2");
    //                $rootScope.$apply();
    //            });
    //        }));

    //        it('returns cvm array', () => {
    //            expect(result.length).toBe(1);
    //            expect(result.pop()).toBe(testCvm);
    //        });
    //    });

    //    describe('when multiple selected choices are set', () => {

    //        var testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
    //        var testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();

    //        beforeEach(inject($rootScope => {

    //            localContext.setSelectedChoice("test3", "test4", testCvm1);
    //            localContext.setSelectedChoice("test3", "test4", testCvm2);

    //            runs(() => {
    //                result = localContext.getSelectedChoice("test3", "test4");
    //                $rootScope.$apply();
    //            });
    //        }));

    //        it('returns cvm array', () => {
    //            expect(result.length).toBe(2);
    //            expect(result.pop()).toBe(testCvm2);
    //            expect(result.pop()).toBe(testCvm1);
    //        });
    //    });

    //    describe('when match parm but not search', () => {

    //        var testCvm = new Spiro.Angular.Modern.ChoiceViewModel();

    //        beforeEach(inject($rootScope => {

    //            localContext.setSelectedChoice("test5", "test6", testCvm);

    //            runs(() => {
    //                result = localContext.getSelectedChoice("test5", "test7");
    //                $rootScope.$apply();
    //            });
    //        }));

    //        it('returns undefined', () => {
    //            expect(result).toBeUndefined();
    //        });
    //    });

    //    describe('when multiple selected choices are set for a parm', () => {

    //        var testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
    //        var testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();

    //        var result1;

    //        beforeEach(inject($rootScope => {

    //            localContext.setSelectedChoice("test6", "test8", testCvm1);
    //            localContext.setSelectedChoice("test6", "test9", testCvm2);

    //            runs(() => {
    //                result = localContext.getSelectedChoice("test6", "test8");
    //                result1 = localContext.getSelectedChoice("test6", "test9");
    //                $rootScope.$apply();
    //            });
    //        }));

    //        it('returns cvm arrays', () => {
    //            expect(result.length).toBe(1);
    //            expect(result1.length).toBe(1);
    //            expect(result.pop()).toBe(testCvm1);
    //            expect(result1.pop()).toBe(testCvm2);
    //        });
    //    });


    //});

});