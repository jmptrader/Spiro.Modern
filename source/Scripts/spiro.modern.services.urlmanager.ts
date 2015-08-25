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
        setMenu(menuId: string);
        setDialog(id: string);
        setObject(resultObject: DomainObjectRepresentation);
        setQuery(action: ActionMember, dvm?: DialogViewModel);
        setProperty(propertyMember: PropertyMember);
        setItem(link: Link): void;

        toggleObjectMenu(): void;

        setCollectionSummary(collection : CollectionMember);
        setCollectionList(collection: CollectionMember);
        setCollectionTable(collection: CollectionMember);
        setCollectionSummary(collection: ListRepresentation);
        setCollectionList(collection: ListRepresentation);
        setCollectionTable(collection: ListRepresentation);

        setObjectEdit();
}

    app.service("urlManager", function($routeParams: ISpiroRouteParams, $location: ng.ILocationService) {
        const helper = <IUrlManager>this;

        function setSearch(parmId: string, parmValue: string, clearOthers: boolean) {
            const search = clearOthers ? {} : $location.search();
            search[parmId] = parmValue;
            $location.search(search);
        }

        helper.setMenu = (menuId: string) => {
            setSearch("menu1", menuId, true);
        };

        helper.setDialog = (dialogId: string) => {
            setSearch("dialog1", dialogId, false);
        };

        helper.setObject = (resultObject: DomainObjectRepresentation) => {
            const oid = `${resultObject.domainType()}-${resultObject.instanceId()}`;
            $location.path("/object").search({ object1: oid });
        };

        helper.setQuery = (action : ActionMember, dvm?: DialogViewModel) => {
            const aid = action.actionId();
            const search = $location.search();

            search.action1 = aid;

            if (dvm) {
                _.each(dvm.parameters, (p) => search[`parm1_${p.id}`] = p.getValue());
            }

            $location.path("/query").search(search);
        };

        helper.setProperty = (propertyMember: PropertyMember) => {
            var href = propertyMember.value().link().href();
            const urlRegex = /(objects|services)\/(.*)\/(.*)/;
            const results = (urlRegex).exec(href);

            const oid = `${results[2]}-${results[3] }`;
            $location.search({ object1: oid });
        }

        helper.setItem = (link: Link) => {
            var href = link.href();
            const urlRegex = /(objects|services)\/(.*)\/(.*)/;
            const results = (urlRegex).exec(href);

            const oid = `${results[2]}-${results[3]}`;
            $location.path("/object").search({ object1: oid });
        }

        helper.toggleObjectMenu = () => {
            var search = $location.search();
            var menu = search.menu1;

            if (menu) {
                search = _.omit(search, "menu1");
            } else {
                search.menu1 = "actions";
            }

            $location.search(search);
        }

        helper.setCollectionSummary = (collection: any) => {
            if (collection instanceof CollectionMember) {
                setSearch(`collection1_${collection.collectionId()}`, "summary", false);
            } else {
                setSearch("collection1", "summary", false);
            }
        }

        helper.setCollectionList = (collection: any) => {
            if (collection instanceof CollectionMember) {
                setSearch(`collection1_${collection.collectionId() }`, "list", false);
            } else {
                setSearch("collection1", "list", false);
            }
        }

        helper.setCollectionTable = (collection: any) => {
            if (collection instanceof CollectionMember) {
                setSearch(`collection1_${collection.collectionId() }`, "table", false);
            } else {
                setSearch("collection1", "table", false);
            }
        }

        helper.setObjectEdit = () => {
           
           setSearch("edit1", "true", false);
            
        }

    });

}