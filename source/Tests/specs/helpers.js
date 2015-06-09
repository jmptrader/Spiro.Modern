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
/// <reference path="../../Scripts/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../Scripts/typings/angularjs/angular-mocks.d.ts" />
function spyOnPromise(tgt, func, mock) {
    var mp = {};
    mp.then = function (f) {
        return f(mock);
    };
    return spyOn(tgt, func).and.returnValue(mp);
}
function spyOnPromiseConditional(tgt, func, mock1, mock2) {
    var mp = {};
    var first = true;
    mp.then = function (f) {
        var result = first ? f(mock1) : f(mock2);
        first = false;
        return result;
    };
    return spyOn(tgt, func).and.returnValue(mp);
}
function mockPromiseFail(mock) {
    var mp = {};
    mp.then = function (fok, fnok) {
        return fnok(mock);
    };
    return mp;
}
// TODO sure this could be recursive - fix once tests are running 
function spyOnPromiseFail(tgt, func, mock) {
    var mp = {};
    mp.then = function (fok, fnok) {
        return fnok ? fnok(mock) : fok(mock);
    };
    return spyOn(tgt, func).and.returnValue(mp);
}
function spyOnPromiseNestedFail(tgt, func, mock) {
    var mp = {};
    mp.then = function (fok) {
        var mmp = {};
        mmp.then = function (f1ok, f1nok) {
            return f1nok(mock);
        };
        return mmp;
    };
    return spyOn(tgt, func).and.returnValue(mp);
}
function spyOnPromise2NestedFail(tgt, func, mock) {
    var mp = {};
    mp.then = function (fok) {
        var mmp = {};
        mmp.then = function (f1ok) {
            var mmmp = {};
            mmmp.then = function (f2ok, f2nok) {
                return f2nok(mock);
            };
            return mmmp;
        };
        return mmp;
    };
    return spyOn(tgt, func).and.returnValue(mp);
}
//# sourceMappingURL=helpers.js.map