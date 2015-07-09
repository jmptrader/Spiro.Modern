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

/// <reference path="typings/lodash/lodash.d.ts" />
/// <reference path="spiro.models.ts" />


module Spiro.Angular.Modern {

    export interface INavigation {
        back();
        forward();
        push();
    }

    app.service('navigation', function($location: ng.ILocationService, $routeParams: ISpiroRouteParams) {
        const nav = <INavigation>this;
        nav.back = () => {
            
            if ($routeParams.resultObject || $routeParams.resultCollection) {
                // looking at an action result = so go back two 
                parent.history.back(2);
            } else {
                parent.history.back(1);
            }
        };

        nav.forward = () => {
            parent.history.forward(1);
        };

        nav.push = () => {

        };

    });
}