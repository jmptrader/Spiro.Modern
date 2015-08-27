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

// tested 
module Spiro.Angular.Modern {

 
    app.controller("Pane1HomeController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {
        // get parm match type and call correct handler.     

        var menuId = $routeParams.menu1;
        var dialogId = $routeParams.dialog1;

        handlers.handleHome($scope, menuId, dialogId);
    });

    app.controller("Pane2HomeController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {
        // get parm match type and call correct handler. 
    

        handlers.handleHome($scope);
    });

    app.controller("Pane1ObjectController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams,   handlers: IHandlers) => {
        // get parm match type and call correct handler. 

        var objectId = $routeParams.object1;
        var menuId = $routeParams.menu1;
        var dialogId = $routeParams.dialog1;

        var collIds = <{ [index: string]: string }> _.pick($routeParams , (v : string, k : string) => k.indexOf("collection1") === 0);
        //missing from lodash types :-( 
        var collections : {[index : string] : string}  = (<any>_).mapKeys(collIds, (v, k) =>  k.substr(k.indexOf("_") + 1) );

        var edit = $routeParams.edit1 === "true";

        handlers.handlePaneObject($scope, objectId, collections, edit, menuId, dialogId);
    });

    app.controller("Pane2ObjectController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {

        handlers.handlePaneObject($scope, "todo", {}, false);
    });

    app.controller("Pane1QueryController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {

        var menuId = $routeParams.menu1;
        var objectId = $routeParams.object1;

        var actionId = $routeParams.action1;
        var state = $routeParams.collection1 || "list";

        // todo make parm ids dictionary same as collections ids ? 
        var parmIds = <{[index :string] : string}> _.pick($routeParams, (v, k) => k.indexOf("parm1") === 0);
        var parms = _.map(parmIds, (v, k) => { return { id: k.substr(k.indexOf("_") + 1), val: v } });

        handlers.handleQuery($scope, menuId, objectId, actionId, state, parms);
    });

    app.controller("Pane2QueryController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {

        var p2 = $routeParams["pane2"];
        var rx = /(.*)-(.*)/;

        var results = rx.exec(p2);

        handlers.handlePaneObject($scope, "todo", {}, false);
    });


	// tested
    app.controller("BackgroundController", ($scope: ng.IScope, handlers: IHandlers) => {
	    handlers.handleBackground($scope); 
    });

    // tested
    app.controller("ServicesController", ($scope : ng.IScope, handlers: IHandlers) => {
	    handlers.handleServices($scope);
    });

    // tested
    app.controller("ServiceController", ($scope: ng.IScope, handlers: IHandlers) => {
	    handlers.handleService($scope);
    });

    // tested
    app.controller("DialogController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {
	    if ($routeParams.action) {
		    handlers.handleActionDialog($scope);
	    }
    });

    // tested
    app.controller("NestedObjectController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {

	    // action takes priority 
	    if ($routeParams.action) {
		    handlers.handleActionResult($scope);
	    }
	    // action + one of  
	    if ($routeParams.property) {
		    handlers.handleProperty($scope);
	    }
	    else if ($routeParams.collectionItem) {
		    handlers.handleCollectionItem($scope);
	    }
	    else if ($routeParams.resultObject) {
		    handlers.handleResult($scope);
	    }
    });

    // tested
    app.controller("CollectionController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {
	    if ($routeParams.resultCollection) {
		    handlers.handleCollectionResult($scope);
	    }
	    else if ($routeParams.collection) {
		    handlers.handleCollection($scope);
	    }
    });

    // tested
    app.controller("ObjectController", ($scope: ng.IScope, $routeParams: ISpiroRouteParams, handlers: IHandlers) => {
	    if ($routeParams.editMode) {
		    handlers.handleEditObject($scope);
	    }
	    else {
		    handlers.handleObject($scope);
	    }
    });

    // tested
    app.controller("TransientObjectController", ($scope: ng.IScope, handlers: IHandlers) => {
	    handlers.handleTransientObject($scope);
    });

    // tested
    app.controller("ErrorController", ($scope: ng.IScope, handlers: IHandlers) => {
	    handlers.handleError($scope);
    });

    // tested
    app.controller("AppBarController", ($scope: ng.IScope, handlers: IHandlers) => {
	    handlers.handleAppBar($scope);    
    });
}