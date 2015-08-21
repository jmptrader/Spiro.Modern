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
            Angular.app.service("urlManager", function ($routeParams, $location) {
                var helper = this;
                function setSearch(parmId, parmValue, clearOthers) {
                    var search = clearOthers ? {} : $location.search();
                    search[parmId] = parmValue;
                    $location.search(search);
                }
                helper.setMenu = function (menuId) {
                    setSearch("menu1", menuId, true);
                };
                helper.setDialog = function (dialogId) {
                    setSearch("dialog1", dialogId, false);
                };
                helper.setObject = function (resultObject) {
                    var oid = resultObject.domainType() + "-" + resultObject.instanceId();
                    $location.path("/object").search({ object1: oid });
                };
                helper.setQuery = function (action, dvm) {
                    var aid = action.actionId();
                    var search = $location.search();
                    search.action1 = aid;
                    if (dvm) {
                        _.each(dvm.parameters, function (p) { return search[("parm1_" + p.id)] = p.getValue(); });
                    }
                    $location.path("/query").search(search);
                };
                helper.setProperty = function (propertyMember) {
                    var href = propertyMember.value().link().href();
                    var urlRegex = /(objects|services)\/(.*)\/(.*)/;
                    var results = (urlRegex).exec(href);
                    var oid = results[2] + "-" + results[3];
                    $location.search({ object1: oid });
                };
                helper.setItem = function (link) {
                    var href = link.href();
                    var urlRegex = /(objects|services)\/(.*)\/(.*)/;
                    var results = (urlRegex).exec(href);
                    var oid = results[2] + "-" + results[3];
                    $location.path("/object").search({ object1: oid });
                };
                helper.toggleObjectMenu = function () {
                    var search = $location.search();
                    var menu = search.menu1;
                    if (menu) {
                        search = _.omit(search, "menu1");
                    }
                    else {
                        search.menu1 = "actions";
                    }
                    $location.search(search);
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.urlmanager.js.map