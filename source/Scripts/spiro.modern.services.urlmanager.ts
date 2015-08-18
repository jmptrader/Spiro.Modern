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

    export interface IUrlManager {
       setMenu(menuId : string);
       setDialog(id: string);
    }

    app.service('urlManager', function ($routeParams : ISpiroRouteParams, $location : ng.ILocationService) {

        var helper = <IUrlManager>this;

        function setSearch(parmId: string, parmValue: string, clearOthers: boolean) {
            var search = clearOthers ? {} : $location.search();
            search[parmId] = parmValue;
            $location.search(search);
        }

        helper.setMenu = (menuId: string) => {
            setSearch("menu1", menuId, true);
        }

        helper.setDialog = (dialogId: string) => {
            setSearch("dialog1", dialogId, false);
        }
    });

}