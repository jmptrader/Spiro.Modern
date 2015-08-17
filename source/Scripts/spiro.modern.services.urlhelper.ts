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



module Spiro.Angular.Modern {

    export interface IUrlHelper {
        action(dvm?: DialogViewModel): string;
        actionParms(): string[];
        getOtherParms(excepts?: string[]): string;
        toAppUrl(href: string, toClose?: string[]): string;

        toNewAppUrl(href: string, toClose?: string[]): string;
        toNewAppUrl2(href: string): string;



        toActionUrl(href: string): string;
        toPropertyUrl(href: string): string;
        toCollectionUrl(href: string): string;
        toItemUrl(href: string, itemHref: string): string;

        toObjectPath(obj: DomainObjectRepresentation): string;
        toTransientObjectPath(obj: DomainObjectRepresentation): string;
        toErrorPath(): string;
        updateParms(resultObj: DomainObjectRepresentation, dvm?: DialogViewModel) : string;
        updateParms(resultList: ListRepresentation, dvm?: DialogViewModel) : string;
    }

    app.service('urlHelper', function ($routeParams : ISpiroRouteParams) {

        var helper = <IUrlHelper>this;

        helper.action = function (dvm?: DialogViewModel) {
            const pps = dvm && dvm.parameters.length > 0 ? _.reduce(dvm.parameters, (memo : string, parm : ParameterViewModel) => { return memo + "/" + parm.getMemento(); }, "") : "";
            return _.first($routeParams.action.split("/")) + encodeURIComponent(pps);
        }

        helper.actionParms = function () {
            return _.rest($routeParams.action.split("/"));
        }

        helper.getOtherParms = function (excepts?: string[]) {

            function include(parm) {
                return $routeParams[parm] && !_.any(excepts, (except) => parm === except);
            }

            function getParm(name: string) {
                return include(name) ? `&${name}=${$routeParams[name]}` : "";
            }

            const actionParm = include("action") ? `&action=${helper.action()}` : "";
            const collectionParm = include("collection") ? `&collection=${$routeParams.collection}` : "";
            const collectionItemParm = include("collectionItem") ? `&collectionItem=${$routeParams.collectionItem}` : "";
            const propertyParm = include("property") ? `&property=${$routeParams.property}` : "";
            const resultObjectParm = include("resultObject") ? `&resultObject=${$routeParams.resultObject}` : "";
            const resultCollectionParm = include("resultCollection") ? `&resultCollection=${$routeParams.resultCollection}` : "";
            return actionParm + collectionParm + collectionItemParm + propertyParm + resultObjectParm + resultCollectionParm;
        }

        function toMenuUrl (href: string, toClose?: string[]): string {
            const urlRegex = /(menus)\/(.*)/;
            const results = (urlRegex).exec(href);
           

            return `#/home?menu1=${results[2]}`;
        }



        helper.toAppUrl = function (href: string, toClose?: string[]): string {
            // temp kludge 
            if (href.indexOf("menus") > -1) {
                return toMenuUrl(href, toClose);
            }


            const urlRegex = /(objects|services)\/(.*)/;
            const results = (urlRegex).exec(href);
            var parms = "";

            if (toClose) {
                parms = helper.getOtherParms(toClose);
                parms = parms ? `?${parms.substr(1)}` : "";
            }

            return (results && results.length > 2) ? `#/${results[1]}/${results[2]}${parms}` : "";
        }

        helper.toNewAppUrl = function (href: string): string {
            const urlRegex = /(objects|services)\/(.*)\/(.*)/;
            const results = (urlRegex).exec(href);
          

            return (results && results.length > 2) ? `#/object?pane1=${results[2]}-${results[3]}` : "";            
        }

        helper.toNewAppUrl2 = function(href: string): string {
            const urlRegex = /(objects|services)\/(.*)\/(.*)/;
            const results = (urlRegex).exec(href);

            var p1 = $routeParams["pane1"];

          

            return (results && results.length > 2) ? `#/object/object?pane1=${p1}&pane2=${results[2]}-${results[3]}` : "";
        }




        helper.toActionUrl = function (href: string): string {
            const urlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)\/actions\/([\w|\.]+)/;
            const results = (urlRegex).exec(href);
            return (results && results.length > 3) ? `#/${results[1]}/${results[2]}?action=${results[4]}${helper.getOtherParms(["action"])}` : "";
        }

        helper.toPropertyUrl = function (href: string): string {
            const urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)\/(properties)\/([\w|\.]+)/;
            const results = (urlRegex).exec(href);
            return (results && results.length > 5) ? `#/${results[1]}/${results[2]}/${results[3]}?property=${results[5]}${helper.getOtherParms(["property", "collectionItem", "resultObject"])}` : "";
        }

        helper.toCollectionUrl = function (href: string): string {
            const urlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)\/(collections)\/([\w|\.]+)/;
            const results = (urlRegex).exec(href);
            return (results && results.length > 5) ? `#/${results[1]}/${results[2]}/${results[3]}?collection=${results[5]}${helper.getOtherParms(["collection", "resultCollection"])}` : "";
        }

        helper.toItemUrl = function (href: string, itemHref: string): string {
            const parentUrlRegex = /(services|objects)\/([\w|\.]+(\/[\w|\.|-]+)?)/;
            const itemUrlRegex = /(objects)\/([\w|\.]+)\/([\w|\.|-]+)/;
            const parentResults = (parentUrlRegex).exec(href);
            const itemResults = (itemUrlRegex).exec(itemHref);
            return (parentResults && parentResults.length > 2) ? `#/${parentResults[1]}/${parentResults[2]}?collectionItem=${itemResults[2]}/${itemResults[3]}${helper.getOtherParms(["property", "collectionItem", "resultObject"])}` : "";
        }

        helper.toTransientObjectPath = function (obj: DomainObjectRepresentation) {
            return `objects/${obj.domainType()}`; 
        }

        helper.toObjectPath = function (obj : DomainObjectRepresentation) {
            return `objects/${obj.domainType()}/${obj.instanceId()}`;  
        }

        helper.toErrorPath = function () {
            return "error";
        }

        helper.updateParms = function (result: Object, dvm?: DialogViewModel) : string {

            var resultParm = "";
            var actionParm = "";

            function getActionParm() {
                if (dvm) {
                    return dvm.show ? `&action=${helper.action(dvm)}` : "";
                }
                return ""; 
            }

            if (result instanceof DomainObjectRepresentation) {
                resultParm = `resultObject=${result.domainType()}-${result.instanceId()}`;  // todo add some parm handling code 
                actionParm = getActionParm();
            }

            if (result instanceof ListRepresentation) {
                resultParm = `resultCollection=${helper.action(dvm)}`;
                actionParm = getActionParm();
            }

            return resultParm + actionParm;
        }
    });

}