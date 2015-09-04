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
                function clearSearch(parmId) {
                    var search = $location.search();
                    search = _.omit(search, parmId);
                    $location.search(search);
                }
                helper.setMenu = function (menuId) {
                    setSearch("menu1", menuId, true);
                };
                helper.setDialog = function (dialogId) {
                    setSearch("dialog1", dialogId, false);
                };
                helper.closeDialog = function () {
                    clearSearch("dialog1");
                };
                helper.setObject = function (resultObject, transient) {
                    var oid = resultObject.domainType() + "-" + resultObject.instanceId();
                    var search = { object1: oid };
                    $location.path("/object").search(search);
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
                helper.setCollectionState = function (collection, state) {
                    if (collection instanceof Spiro.CollectionMember) {
                        setSearch("collection1_" + collection.collectionId(), Modern.CollectionViewState[state], false);
                    }
                    else {
                        setSearch("collection1", Modern.CollectionViewState[state], false);
                    }
                };
                helper.setObjectEdit = function (edit) {
                    setSearch("edit1", edit.toString(), false);
                };
                helper.setError = function () {
                    $location.path("/error").search({});
                };
                helper.getRouteData = function () {
                    var routeData = new Modern.RouteData();
                    routeData.pane1.menuId = $routeParams.menu1;
                    routeData.pane1.dialogId = $routeParams.dialog1;
                    routeData.pane1.objectId = $routeParams.object1;
                    var collIds = _.pick($routeParams, function (v, k) { return k.indexOf("collection1") === 0; });
                    //missing from lodash types :-( 
                    var keysMapped = _.mapKeys(collIds, function (v, k) { return k.substr(k.indexOf("_") + 1); });
                    routeData.pane1.collections = _.mapValues(keysMapped, function (v) { return Modern.CollectionViewState[v]; });
                    routeData.pane1.edit = $routeParams.edit1 === "true";
                    routeData.pane1.actionId = $routeParams.action1;
                    routeData.pane1.state = $routeParams.collection1 ? Modern.CollectionViewState[$routeParams.collection1] : Modern.CollectionViewState.List;
                    // todo make parm ids dictionary same as collections ids ? 
                    var parmIds = _.pick($routeParams, function (v, k) { return k.indexOf("parm1") === 0; });
                    routeData.pane1.parms = _.map(parmIds, function (v, k) { return { id: k.substr(k.indexOf("_") + 1), val: v }; });
                    return routeData;
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.urlmanager.js.map