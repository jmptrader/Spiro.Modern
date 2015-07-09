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
            Angular.app.service('urlHelper', function ($routeParams) {
                var helper = this;
                helper.action = function (dvm) {
                    var pps = dvm && dvm.parameters.length > 0 ? _.reduce(dvm.parameters, function (memo, parm) { return memo + "/" + parm.getMemento(); }, "") : "";
                    return _.first($routeParams.action.split("/")) + encodeURIComponent(pps);
                };
                helper.actionParms = function () {
                    return _.rest($routeParams.action.split("/"));
                };
                helper.getOtherParms = function (excepts) {
                    function include(parm) {
                        return $routeParams[parm] && !_.any(excepts, function (except) { return parm === except; });
                    }
                    function getParm(name) {
                        return include(name) ? "&" + name + "=" + $routeParams[name] : "";
                    }
                    var actionParm = include("action") ? "&action=" + helper.action() : "";
                    var collectionParm = include("collection") ? "&collection=" + $routeParams.collection : "";
                    var collectionItemParm = include("collectionItem") ? "&collectionItem=" + $routeParams.collectionItem : "";
                    var propertyParm = include("property") ? "&property=" + $routeParams.property : "";
                    var resultObjectParm = include("resultObject") ? "&resultObject=" + $routeParams.resultObject : "";
                    var resultCollectionParm = include("resultCollection") ? "&resultCollection=" + $routeParams.resultCollection : "";
                    return actionParm + collectionParm + collectionItemParm + propertyParm + resultObjectParm + resultCollectionParm;
                };
                helper.toAppUrl = function (href, toClose) {
                    var urlRegex = /(objects|services)\/(.*)/;
                    var results = (urlRegex).exec(href);
                    var parms = "";
                    if (toClose) {
                        parms = helper.getOtherParms(toClose);
                        parms = parms ? "?" + parms.substr(1) : "";
                    }
                    return (results && results.length > 2) ? "#/" + results[1] + "/" + results[2] + parms : "";
                };
                helper.toActionUrl = function (href) {
                    var urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)\/actions\/([\w|\.]+)/;
                    var results = (urlRegex).exec(href);
                    return (results && results.length > 3) ? "#/" + results[1] + "/" + results[2] + "?action=" + results[4] + helper.getOtherParms(["action"]) : "";
                };
                helper.toPropertyUrl = function (href) {
                    var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)\/(properties)\/([\w|\.]+)/;
                    var results = (urlRegex).exec(href);
                    return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?property=" + results[5] + helper.getOtherParms(["property", "collectionItem", "resultObject"]) : "";
                };
                helper.toCollectionUrl = function (href) {
                    var urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)\/(collections)\/([\w|\.]+)/;
                    var results = (urlRegex).exec(href);
                    return (results && results.length > 5) ? "#/" + results[1] + "/" + results[2] + "/" + results[3] + "?collection=" + results[5] + helper.getOtherParms(["collection", "resultCollection"]) : "";
                };
                helper.toItemUrl = function (href, itemHref) {
                    var parentUrlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)/;
                    var itemUrlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)/;
                    var parentResults = (parentUrlRegex).exec(href);
                    var itemResults = (itemUrlRegex).exec(itemHref);
                    return (parentResults && parentResults.length > 2) ? "#/" + parentResults[1] + "/" + parentResults[2] + "?collectionItem=" + itemResults[2] + "/" + itemResults[3] + helper.getOtherParms(["property", "collectionItem", "resultObject"]) : "";
                };
                helper.toTransientObjectPath = function (obj) {
                    return "objects/" + obj.domainType();
                };
                helper.toObjectPath = function (obj) {
                    return "objects/" + obj.domainType() + "/" + obj.instanceId();
                };
                helper.toErrorPath = function () {
                    return "error";
                };
                helper.updateParms = function (result, dvm) {
                    var resultParm = "";
                    var actionParm = "";
                    function getActionParm() {
                        if (dvm) {
                            return dvm.show ? "&action=" + helper.action(dvm) : "";
                        }
                        return "";
                    }
                    if (result instanceof Spiro.DomainObjectRepresentation) {
                        resultParm = "resultObject=" + result.domainType() + "-" + result.instanceId(); // todo add some parm handling code 
                        actionParm = getActionParm();
                    }
                    if (result instanceof Spiro.ListRepresentation) {
                        resultParm = "resultCollection=" + helper.action(dvm);
                        actionParm = getActionParm();
                    }
                    return resultParm + actionParm;
                };
            });
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.services.urlhelper.js.map