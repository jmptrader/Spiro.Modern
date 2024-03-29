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
/// <reference path="spiro.models.ts" />
var Spiro;
(function (Spiro) {
    var Angular;
    (function (Angular) {
        var Modern;
        (function (Modern) {
            (function (CollectionViewState) {
                CollectionViewState[CollectionViewState["Summary"] = 0] = "Summary";
                CollectionViewState[CollectionViewState["List"] = 1] = "List";
                CollectionViewState[CollectionViewState["Table"] = 2] = "Table";
            })(Modern.CollectionViewState || (Modern.CollectionViewState = {}));
            var CollectionViewState = Modern.CollectionViewState;
            var RouteData = (function () {
                function RouteData() {
                    this.pane1 = new PaneRouteData();
                    this.pane2 = new PaneRouteData();
                }
                return RouteData;
            })();
            Modern.RouteData = RouteData;
            var PaneRouteData = (function () {
                function PaneRouteData() {
                }
                return PaneRouteData;
            })();
            Modern.PaneRouteData = PaneRouteData;
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.routedata.js.map