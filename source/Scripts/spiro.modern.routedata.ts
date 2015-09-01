﻿//Copyright 2014 Stef Cascarini, Dan Haywood, Richard Pawson
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
/// <reference path="spiro.models.ts" />


module Spiro.Angular.Modern {

    export enum CollectionViewState {
        Summary, 
        List,
        Table
    }

    export class RouteData {
        constructor() {
            this.pane1 = new PaneRouteData();
            this.pane2 = new PaneRouteData();
        }

        pane1: PaneRouteData;
        pane2: PaneRouteData;
    }

    export class PaneRouteData {
        objectId : string;
        menuId : string;
        dialogId: string;
        collections: _.Dictionary<CollectionViewState>;
        edit: boolean;
        actionId: string;
        state: CollectionViewState;
        // todo make parm ids dictionary same as collections ids ? 
        parms: { id: string; val: string }[];
    }
}