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
/// <reference path="typings/angularjs/angular-route.d.ts" />

module Spiro.Angular {

    /* Declare app level module */
   
    export var app = angular.module("app", ["ngRoute", "ngTouch"]);

    export interface ISpiroRouteParams extends ng.route.IRouteParamsService {
        action: string;
        property: string;
        collectionItem: string;
        resultObject: string; 
        resultCollection: string; 
        collection: string; 
        editMode: string; 
        tableMode: string; 
        dt: string; 
        id: string; 
        sid: string; 

        menu1: string;
        dialog1 : string;



    }

    function getSvrPath() {
        var trimmedPath = svrPath.trim();

        if (trimmedPath.length === 0 || trimmedPath.charAt(svrPath.length - 1) === "/") {
            return trimmedPath;
        }
        return trimmedPath + "/";
    }

    // templates 
    export var nestedCollectionTemplate = getSvrPath() + "Content/partials/nestedCollection.html";
    export var nestedCollectionTableTemplate = getSvrPath() + "Content/partials/nestedCollectionTable.html";
    export var nestedObjectTemplate = getSvrPath() + "Content/partials/nestedObject.html";
    export var dialogTemplate = getSvrPath() + "Content/partials/dialog.html";
    export var servicesTemplate = getSvrPath() + "Content/partials/services.html";
    export var serviceTemplate = getSvrPath() + "Content/partials/service.html";
    export var actionTemplate = getSvrPath() + "Content/partials/actions.html";
    export var errorTemplate = getSvrPath() + "Content/partials/error.html";
    export var appBarTemplate = getSvrPath() + "Content/partials/appbar.html";

    export var viewPropertiesTemplate = getSvrPath() + "Content/partials/viewProperties.html";
    export var editPropertiesTemplate = getSvrPath() + "Content/partials/editProperties.html";

    var servicesPageTemplate = getSvrPath() + "Content/partials/servicesPage.html";
    var servicePageTemplate = getSvrPath() + "Content/partials/servicePage.html";
    var objectPageTemplate = getSvrPath() + "Content/partials/objectPage.html";
    var transientObjectPageTemplate = getSvrPath() + "Content/partials/transientObjectPage.html";
    var errorPageTemplate = getSvrPath() + "Content/partials/errorPage.html";

    //All Modern2 templates below:
    var singleHomePageTemplate = getSvrPath() + "Content/partials/singleHomePage.html";
    var singleObjectPageTemplate = getSvrPath() + "Content/partials/singleObjectPage.html";
    var singleQueryPageTemplate = getSvrPath() + "Content/partials/singleQueryPage.html";
    var splitHomeHomePageTemplate = getSvrPath() + "Content/partials/splitHomeHomePage.html";
    var splitHomeObjectPageTemplate = getSvrPath() + "Content/partials/splitHomeObjectPage.html";
    var splitHomeQueryPageTemplate = getSvrPath() + "Content/partials/splitHomeQueryPage.html";
    var splitObjectHomePageTemplate = getSvrPath() + "Content/partials/splitObjectHomePage.html";
    var splitObjectObjectPageTemplate = getSvrPath() + "Content/partials/splitObjectObjectPage.html";
    var splitObjectQueryPageTemplate = getSvrPath() + "Content/partials/splitObjectQueryPage.html";
    var splitQueryHomePageTemplate = getSvrPath() + "Content/partials/splitQueryHomePage.html";
    var splitQueryObjectPageTemplate = getSvrPath() + "Content/partials/splitQueryObjectPage.html";
    var splitQueryQueryPageTemplate = getSvrPath() + "Content/partials/splitQueryQueryPage.html";
    export var homeTemplate = getSvrPath() + "Content/partials/home.html";
    export var objectTemplate = getSvrPath() + "Content/partials/object.html";
    export var queryTemplate = getSvrPath() + "Content/partials/query.html";
    export var footerTemplate = getSvrPath() + "Content/partials/footer.html";
    export var actionsTemplate = getSvrPath() + "Content/partials/actions.html";


    app.config(($routeProvider: ng.route.IRouteProvider) => {
        $routeProvider.
            when("/services", {
                templateUrl: servicesPageTemplate,
                controller: "BackgroundController"
            }).
            when("/services/:sid", {
                templateUrl: servicePageTemplate,
                controller: "BackgroundController"
            }).
            when("/objects/:dt/:id", {
                templateUrl: objectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/objects/:dt", {
                templateUrl: transientObjectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/error", {
                templateUrl: errorPageTemplate,
                controller: "BackgroundController"
            }).
            //Modern2 Urls below:
            when("/home", {
                templateUrl: singleHomePageTemplate,
                controller: "BackgroundController"
            }).
            when("/object", {
                templateUrl: singleObjectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/query", {
                templateUrl: singleQueryPageTemplate,
                controller: "BackgroundController"
            }).
            when("/home/home", {
                templateUrl: splitHomeHomePageTemplate,
                controller: "BackgroundController"
            }).
            when("/home/object", {
                templateUrl: splitHomeObjectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/home/query", {
                templateUrl: splitHomeQueryPageTemplate,
                controller: "BackgroundController"
            }).
            when("/object/home", {
                templateUrl: splitObjectHomePageTemplate,
                controller: "BackgroundController"
            }).
            when("/object/object", {
                templateUrl: splitObjectObjectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/object/query", {
                templateUrl: splitObjectQueryPageTemplate,
                controller: "BackgroundController"
            }).
            when("/query/home", {
                templateUrl: splitQueryHomePageTemplate,
                controller: "BackgroundController"
            }).
            when("/query/object", {
                templateUrl: splitQueryObjectPageTemplate,
                controller: "BackgroundController"
            }).
            when("/query/query", {
                templateUrl: splitQueryQueryPageTemplate,
                controller: "BackgroundController"
            }).
            //TODO: change default to /home when Modern2 is complete
            otherwise({
                redirectTo: "/home"
            });
       
    });

    app.run((color: Angular.IColor, mask: Angular.IMask, $cacheFactory) => {

        $cacheFactory("recentlyViewed");

        color.setColorMap({
            "AdventureWorksModel.CustomerRepository": "redLight",
            "AdventureWorksModel.Store": "red",
            "AdventureWorksModel.Individual": "red",
            "AdventureWorksModel.OrderRepository": "green",
            "AdventureWorksModel.SalesOrderHeader": "greenDark",
            "AdventureWorksModel.SalesOrderDetail": "green",
            "AdventureWorksModel.ProductRepository": "orange",
            "AdventureWorksModel.Product": "orangeDark",
            "AdventureWorksModel.ProductInventory": "orange",
            "AdventureWorksModel.ProductReview": "orange",
            "AdventureWorksModel.ProductModel": "yellow",
            "AdventureWorksModel.ProductCategory": "redLight",
            "AdventureWorksModel.ProductSubCategory": "red",
            "AdventureWorksModel.EmployeeRepository": "blue",
            "AdventureWorksModel.Employee": "blueDark",
            "AdventureWorksModel.EmployeePayHistory": "blue",
            "AdventureWorksModel.EmployeeDepartmentHistory": "blue",
            "AdventureWorksModel.SalesRepository": "purple",
            "AdventureWorksModel.SalesPerson": "purple",
            "AdventureWorksModel.SpecialOfferRepository": "pink",
            "AdventureWorksModel.SpecialOffer": "pinkDark",
            "AdventureWorksModel.ContactRepository": "teal",
            "AdventureWorksModel.Contact": "teal",
            "AdventureWorksModel.VendorRepository": "greenDark",
            "AdventureWorksModel.Vendor": "greenDark",
            "AdventureWorksModel.PurchaseOrderRepository": "grayDark",
            "AdventureWorksModel.PurchaseOrder": "grayDark",
            "AdventureWorksModel.WorkOrderRepository": "orangeDark",
            "AdventureWorksModel.WorkOrder": "orangeDark",
            "AdventureWorksModel.OrderContributedActions": "darkBlue",
            "AdventureWorksModel.CustomerContributedActions": "darkBlue"
        });

        color.setDefaultColorArray([
            "blue", //0
            "blueLight", //1
            "blueDark", //2
            "green", //3
            "greenLight", //4
            "greenDark", //5
            "red", //6
            "yellow", //7
            "orange", //8
            "orange", //9
            "orangeDark", //10
            "pink", //11
            "pinkDark", //12
            "purple", //13
            "grayDark", //14
            "magenta", //15
            "teal", //16
            "redLight" //17
        ]);

        color.setDefaultColor("darkBlue");

        // map to convert from mask representation in RO extension to client represention.
        mask.setMaskMap({
            "d": { name: "date", mask: "d MMM yyyy" }
        });
    });
}