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
/// <reference path="../../Scripts/spiro.modern.services.handlers.ts" />
/// <reference path="../../Scripts/spiro.modern.viewmodels.ts" />
/// <reference path="helpers.ts" />
describe('context Service', function () {
    beforeEach(module('app'));
    describe('getHome', function () {
        var testHome = new Spiro.HomePageRepresentation();
        var localContext;
        var result;
        beforeEach(inject(function ($rootScope, $routeParams, context, repLoader) {
            spyOnPromise(repLoader, 'populate', testHome);
            localContext = context;
            runs(function () {
                localContext.getHome().then(function (home) {
                    result = home;
                });
                $rootScope.$apply();
            });
            waitsFor(function () { return !!result; }, "result not set", 1000);
        }));
        describe('when currentHome is set', function () {
            beforeEach(inject(function ($rootScope) {
                // currentHome set already 
                result = null;
                runs(function () {
                    localContext.getHome().then(function (home) {
                        result = home;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns home page representation', function () {
                expect(result).toBe(testHome);
            });
        });
        describe('when currentHome is not set', function () {
            it('returns home page representation', function () {
                expect(result).toBe(testHome);
            });
        });
    });
    describe('getServices', function () {
        var testServices = new Spiro.DomainServicesRepresentation();
        var testHome = new Spiro.HomePageRepresentation();
        var localContext;
        var result;
        beforeEach(inject(function ($rootScope, $routeParams, context, repLoader) {
            spyOnPromise(repLoader, 'populate', testServices);
            spyOnPromise(context, 'getHome', testHome);
            spyOn(testHome, 'getDomainServices').andReturn(testServices);
            localContext = context;
            runs(function () {
                localContext.getServices().then(function (services) {
                    result = services;
                });
                $rootScope.$apply();
            });
            waitsFor(function () { return !!result; }, "result not set", 1000);
        }));
        describe('when currentServices is set', function () {
            beforeEach(inject(function ($rootScope) {
                // currentServices set already 
                result = null;
                runs(function () {
                    localContext.getServices().then(function (services) {
                        result = services;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns services representation', function () {
                expect(result).toBe(testServices);
            });
        });
        describe('when currentServices is not set', function () {
            it('returns services representation', function () {
                expect(result).toBe(testServices);
            });
        });
    });
    describe('getObject', function () {
        var testObject = new Spiro.DomainObjectRepresentation();
        var localContext;
        var result;
        var getDomainObject;
        var getService;
        beforeEach(inject(function ($rootScope, $routeParams, context, repLoader) {
            spyOnPromise(repLoader, 'populate', testObject);
            getDomainObject = spyOnPromise(context, 'getDomainObject', testObject);
            getService = spyOnPromise(context, 'getService', testObject);
            spyOn(testObject, 'domainType').andReturn("test");
            spyOn(testObject, 'instanceId').andReturn("1");
            spyOn(testObject, 'serviceId').andReturn(undefined);
            localContext = context;
        }));
        describe('when currentObject is set', function () {
            beforeEach(inject(function ($rootScope) {
                localContext.setObject(testObject);
                runs(function () {
                    localContext.getObject("test", "1").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(getDomainObject).not.toHaveBeenCalled();
                expect(getService).not.toHaveBeenCalled();
                expect(result).toBe(testObject);
            });
        });
        describe('when currentObject is set but not same', function () {
            beforeEach(inject(function ($rootScope) {
                localContext.setObject(testObject);
                runs(function () {
                    localContext.getObject("test2", "2").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(getDomainObject).toHaveBeenCalledWith("test2", "2");
                expect(getService).not.toHaveBeenCalled();
                expect(result).toBe(testObject);
            });
        });
        describe('when currentObject is not set', function () {
            beforeEach(inject(function ($rootScope) {
                runs(function () {
                    localContext.getObject("test", "1").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(getDomainObject).toHaveBeenCalledWith("test", "1");
                expect(getService).not.toHaveBeenCalled();
                expect(result).toBe(testObject);
            });
        });
    });
    describe('getNestedObject', function () {
        var testObject = new Spiro.DomainObjectRepresentation();
        var localContext;
        var result;
        var populate;
        beforeEach(inject(function ($rootScope, $routeParams, context) {
            spyOn(testObject, 'domainType').andReturn("test");
            spyOn(testObject, 'instanceId').andReturn("1");
            spyOn(testObject, 'serviceId').andReturn(undefined);
            localContext = context;
        }));
        describe('when nestedObject is set', function () {
            beforeEach(inject(function ($rootScope, repLoader) {
                populate = spyOnPromise(repLoader, 'populate', testObject);
                localContext.setNestedObject(testObject);
                runs(function () {
                    localContext.getNestedObject("test", "1").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(populate).not.toHaveBeenCalled();
                expect(result).toBe(testObject);
            });
        });
        describe('when nestedObject is set but not same', function () {
            var testResult = new Spiro.DomainObjectRepresentation();
            beforeEach(inject(function ($rootScope, repLoader) {
                testResult.hateoasUrl = "objects/test2/2";
                populate = spyOnPromise(repLoader, 'populate', testResult);
                localContext.setNestedObject(testObject);
                runs(function () {
                    localContext.getNestedObject("test2", "2").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(populate).toHaveBeenCalled();
                expect(result).toBe(testResult);
            });
        });
        describe('when nestedObject is not set', function () {
            var testResult = new Spiro.DomainObjectRepresentation();
            beforeEach(inject(function ($rootScope, repLoader) {
                testResult.hateoasUrl = "objects/test/1";
                populate = spyOnPromise(repLoader, 'populate', testResult);
                runs(function () {
                    localContext.getNestedObject("test", "1").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(populate).toHaveBeenCalled();
                expect(result).toBe(testResult);
            });
        });
    });
    describe('getCollection', function () {
        var testObject = new Spiro.ListRepresentation();
        var localContext;
        var result;
        beforeEach(inject(function ($rootScope, $routeParams, context) {
            localContext = context;
        }));
        describe('when collection is set', function () {
            beforeEach(inject(function ($rootScope) {
                localContext.setCollection(testObject);
                runs(function () {
                    localContext.getCollection().then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns collection representation', function () {
                expect(result).toBe(testObject);
            });
        });
        describe('when collection is not set', function () {
            beforeEach(inject(function ($rootScope) {
                var getCollectionRun = false;
                runs(function () {
                    localContext.getCollection().then(function (object) {
                        result = object;
                        getCollectionRun = true;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return getCollectionRun; }, "result not set", 1000);
            }));
            it('returns object representation', function () {
                expect(result).toBeNull();
            });
        });
    });
    describe('getTransientObject', function () {
        var testObject = new Spiro.DomainObjectRepresentation();
        var localContext;
        var result;
        beforeEach(inject(function ($rootScope, $routeParams, context) {
            localContext = context;
        }));
        //describe('when transient is set', () => {
        //    beforeEach(inject($rootScope => {
        //        localContext.setTransientObject(testObject);
        //        runs(() => {
        //            localContext.getTransientObject().then(object => {
        //                result = object;
        //            });
        //            $rootScope.$apply();
        //        });
        //        waitsFor(() => !!result, "result not set", 1000);
        //    }));
        //    it('returns transient representation', () => {
        //        expect(result).toBe(testObject);
        //    });
        //});
        //describe('when transient is not set', () => {
        //    beforeEach(inject($rootScope => {
        //        var getTransientRun = false;
        //        runs(() => {
        //            localContext.getCollection().then(object => {
        //                result = object;
        //                getTransientRun = true;
        //            });
        //            $rootScope.$apply();
        //        });
        //        waitsFor(() => getTransientRun, "result not set", 1000);
        //    }));
        //    it('returns object representation', () => {
        //        expect(result).toBeNull();
        //    });
        //});
    });
    describe('getService', function () {
        var testObject = new Spiro.DomainObjectRepresentation();
        var localContext;
        var result;
        var getDomainObject;
        var getService;
        beforeEach(inject(function ($rootScope, $routeParams, context, repLoader) {
            spyOnPromise(repLoader, 'populate', testObject);
            getDomainObject = spyOnPromise(context, 'getDomainObject', testObject);
            getService = spyOnPromise(context, 'getService', testObject);
            spyOn(testObject, 'domainType').andReturn(undefined);
            spyOn(testObject, 'instanceId').andReturn(undefined);
            spyOn(testObject, 'serviceId').andReturn("test");
            localContext = context;
        }));
        describe('when currentObject is set', function () {
            beforeEach(inject(function ($rootScope) {
                localContext.setObject(testObject);
                runs(function () {
                    localContext.getObject("test").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns service representation', function () {
                expect(getDomainObject).not.toHaveBeenCalled();
                expect(getService).not.toHaveBeenCalled();
                expect(result).toBe(testObject);
            });
        });
        describe('when currentObject is set but is not same', function () {
            beforeEach(inject(function ($rootScope) {
                localContext.setObject(testObject);
                runs(function () {
                    localContext.getObject("test2").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns service representation', function () {
                expect(getDomainObject).not.toHaveBeenCalled();
                expect(getService).toHaveBeenCalledWith("test2");
                expect(result).toBe(testObject);
            });
        });
        describe('when currentObject is not set', function () {
            beforeEach(inject(function ($rootScope) {
                runs(function () {
                    localContext.getObject("test").then(function (object) {
                        result = object;
                    });
                    $rootScope.$apply();
                });
                waitsFor(function () { return !!result; }, "result not set", 1000);
            }));
            it('returns service representation', function () {
                expect(getDomainObject).not.toHaveBeenCalled();
                expect(getService).toHaveBeenCalledWith("test");
                expect(result).toBe(testObject);
            });
        });
    });
    describe('getSelectedChoice', function () {
        var localContext;
        var result;
        beforeEach(inject(function ($rootScope, $routeParams, context) {
            localContext = context;
        }));
        describe('when selected choice is not set', function () {
            beforeEach(inject(function ($rootScope) {
                runs(function () {
                    result = localContext.getSelectedChoice("test", "test");
                    $rootScope.$apply();
                });
            }));
            it('returns empty collection', function () {
                expect(result.length).toBe(0);
            });
        });
        describe('when selected choice is set', function () {
            var testCvm = new Spiro.Angular.Modern.ChoiceViewModel();
            beforeEach(inject(function ($rootScope) {
                localContext.setSelectedChoice("test1", "test2", testCvm);
                runs(function () {
                    result = localContext.getSelectedChoice("test1", "test2");
                    $rootScope.$apply();
                });
            }));
            it('returns cvm array', function () {
                expect(result.length).toBe(1);
                expect(result.pop()).toBe(testCvm);
            });
        });
        describe('when multiple selected choices are set', function () {
            var testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
            var testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();
            beforeEach(inject(function ($rootScope) {
                localContext.setSelectedChoice("test3", "test4", testCvm1);
                localContext.setSelectedChoice("test3", "test4", testCvm2);
                runs(function () {
                    result = localContext.getSelectedChoice("test3", "test4");
                    $rootScope.$apply();
                });
            }));
            it('returns cvm array', function () {
                expect(result.length).toBe(2);
                expect(result.pop()).toBe(testCvm2);
                expect(result.pop()).toBe(testCvm1);
            });
        });
        describe('when match parm but not search', function () {
            var testCvm = new Spiro.Angular.Modern.ChoiceViewModel();
            beforeEach(inject(function ($rootScope) {
                localContext.setSelectedChoice("test5", "test6", testCvm);
                runs(function () {
                    result = localContext.getSelectedChoice("test5", "test7");
                    $rootScope.$apply();
                });
            }));
            it('returns undefined', function () {
                expect(result).toBeUndefined();
            });
        });
        describe('when multiple selected choices are set for a parm', function () {
            var testCvm1 = new Spiro.Angular.Modern.ChoiceViewModel();
            var testCvm2 = new Spiro.Angular.Modern.ChoiceViewModel();
            var result1;
            beforeEach(inject(function ($rootScope) {
                localContext.setSelectedChoice("test6", "test8", testCvm1);
                localContext.setSelectedChoice("test6", "test9", testCvm2);
                runs(function () {
                    result = localContext.getSelectedChoice("test6", "test8");
                    result1 = localContext.getSelectedChoice("test6", "test9");
                    $rootScope.$apply();
                });
            }));
            it('returns cvm arrays', function () {
                expect(result.length).toBe(1);
                expect(result1.length).toBe(1);
                expect(result.pop()).toBe(testCvm1);
                expect(result1.pop()).toBe(testCvm2);
            });
        });
    });
});
//# sourceMappingURL=contextService.js.map