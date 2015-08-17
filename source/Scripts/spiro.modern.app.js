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
var Spiro;
(function (Spiro) {
    var Angular;
    (function (Angular) {
        /* Declare app level module */
        Angular.app = angular.module("app", ["ngRoute", "ngTouch"]);
        function getSvrPath() {
            var trimmedPath = Spiro.svrPath.trim();
            if (trimmedPath.length === 0 || trimmedPath.charAt(Spiro.svrPath.length - 1) === "/") {
                return trimmedPath;
            }
            return trimmedPath + "/";
        }
        // templates 
        Angular.nestedCollectionTemplate = getSvrPath() + "Content/partials/nestedCollection.html";
        Angular.nestedCollectionTableTemplate = getSvrPath() + "Content/partials/nestedCollectionTable.html";
        Angular.nestedObjectTemplate = getSvrPath() + "Content/partials/nestedObject.html";
        Angular.dialogTemplate = getSvrPath() + "Content/partials/dialog.html";
        Angular.servicesTemplate = getSvrPath() + "Content/partials/services.html";
        Angular.serviceTemplate = getSvrPath() + "Content/partials/service.html";
        Angular.actionTemplate = getSvrPath() + "Content/partials/actions.html";
        Angular.errorTemplate = getSvrPath() + "Content/partials/error.html";
        Angular.appBarTemplate = getSvrPath() + "Content/partials/appbar.html";
        Angular.viewPropertiesTemplate = getSvrPath() + "Content/partials/viewProperties.html";
        Angular.editPropertiesTemplate = getSvrPath() + "Content/partials/editProperties.html";
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
        Angular.homeTemplate = getSvrPath() + "Content/partials/home.html";
        Angular.objectTemplate = getSvrPath() + "Content/partials/object.html";
        Angular.queryTemplate = getSvrPath() + "Content/partials/query.html";
        Angular.footerTemplate = getSvrPath() + "Content/partials/footer.html";
        Angular.actionsTemplate = getSvrPath() + "Content/partials/actions.html";
        Angular.app.config(function ($routeProvider) {
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
        Angular.app.run(function (color, mask, $cacheFactory) {
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
                "blue",
                "blueLight",
                "blueDark",
                "green",
                "greenLight",
                "greenDark",
                "red",
                "yellow",
                "orange",
                "orange",
                "orangeDark",
                "pink",
                "pinkDark",
                "purple",
                "grayDark",
                "magenta",
                "teal",
                "redLight" //17
            ]);
            color.setDefaultColor("darkBlue");
            // map to convert from mask representation in RO extension to client represention.
            mask.setMaskMap({
                "d": { name: "date", mask: "d MMM yyyy" }
            });
        });
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.app.js.map