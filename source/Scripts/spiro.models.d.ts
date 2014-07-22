/// <reference path="typings/underscore/underscore.d.ts" />
/// <reference path="spiro.models.shims.d.ts" />
/// <reference path="spiro.config.d.ts" />
declare module Spiro {
    interface HateoasModel {
        hateoasUrl: string;
        method: string;
        url: any;
    }
    interface Extensions {
        friendlyName: string;
        description: string;
        returnType: string;
        optional: boolean;
        hasParams: boolean;
        elementType: string;
        domainType: string;
        pluralName: string;
        format: string;
        memberOrder: number;
        isService: boolean;
        minLength: number;
    }
    interface OptionalCapabilities {
        blobsClobs: string;
        deleteObjects: string;
        domainModel: string;
        protoPersistentObjects: string;
        validateOnly: string;
    }
    class Rel {
        public asString: string;
        public ns: string;
        public uniqueValue: string;
        public parms: string[];
        constructor(asString: string);
        private decomposeRel();
    }
    class MediaType {
        public asString: string;
        public applicationType: string;
        public profile: string;
        public xRoDomainType: string;
        public representationType: string;
        public domainType: string;
        constructor(asString: string);
        private decomposeMediaType();
    }
    class Value {
        private wrapped;
        constructor(raw: any);
        public isReference(): boolean;
        public isList(): boolean;
        public isNull(): boolean;
        public link(): Link;
        public scalar(): Object;
        public list(): Value[];
        public toString(): string;
        public toValueString(): string;
        public set(target: Object, name?: string): void;
    }
    interface ValueMap {
        [index: string]: Value;
    }
    interface ErrorValue {
        value: Value;
        invalidReason: string;
    }
    interface ErrorValueMap {
        [index: string]: ErrorValue;
    }
    class Result {
        public wrapped: any;
        private resultType;
        constructor(wrapped: any, resultType: string);
        public object(): DomainObjectRepresentation;
        public list(): ListRepresentation;
        public scalar(): ScalarValueRepresentation;
        public isNull(): boolean;
        public isVoid(): boolean;
    }
    class NestedRepresentation {
        public wrapped: any;
        constructor(wrapped: any);
        public links(): Links;
        public extensions(): Extensions;
    }
    class HateoasModelBase extends HateoasModelBaseShim implements HateoasModel {
        constructor(object?: any);
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
    }
    class ErrorMap extends HateoasModelBase {
        public statusCode: string;
        public warningMessage: string;
        constructor(map: Object, statusCode: string, warningMessage: string);
        public valuesMap(): ErrorValueMap;
        public invalidReason(): any;
    }
    class UpdateMap extends ArgumentMap implements HateoasModel {
        private domainObject;
        constructor(domainObject: DomainObjectRepresentation, map: Object);
        public onChange(): void;
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
        public properties(): ValueMap;
        public setProperty(name: string, value: Value): void;
    }
    class AddToRemoveFromMap extends ArgumentMap implements HateoasModel {
        private collectionResource;
        constructor(collectionResource: CollectionRepresentation, map: Object, add: boolean);
        public onChange(): void;
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
        public setValue(value: Value): void;
    }
    class ModifyMap extends ArgumentMap implements HateoasModel {
        private propertyResource;
        constructor(propertyResource: PropertyRepresentation, map: Object);
        public onChange(): void;
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
        public setValue(value: Value): void;
    }
    class ClearMap extends ArgumentMap implements HateoasModel {
        constructor(propertyResource: PropertyRepresentation);
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
    }
    class Links extends CollectionShim implements HateoasModel {
        constructor();
        public hateoasUrl: string;
        public method: string;
        public model: typeof Link;
        public models: Link[];
        public parse(response: any): any;
        static WrapLinks(links: any): Links;
        private getLinkByRel(rel);
        public linkByRel(rel: string): Link;
    }
    class ResourceRepresentation extends HateoasModelBase {
        constructor(object?: any);
        private lazyLinks;
        public links(): Links;
        public extensions(): Extensions;
    }
    class ActionResultRepresentation extends ResourceRepresentation {
        constructor(object?: any);
        public selfLink(): Link;
        public getSelf(): ActionResultRepresentation;
        public resultType(): string;
        public result(): Result;
        public setParameter(name: string, value: Value): void;
    }
    class Parameter extends NestedRepresentation {
        public parent: ActionRepresentation;
        constructor(wrapped: any, parent: ActionRepresentation);
        public choices(): ValueMap;
        public promptLink(): Link;
        public getPrompts(): PromptRepresentation;
        public default(): Value;
        public isScalar(): boolean;
        public hasPrompt(): boolean;
    }
    interface ParameterMap {
        [index: string]: Parameter;
    }
    class ActionRepresentation extends ResourceRepresentation {
        public selfLink(): Link;
        public upLink(): Link;
        public invokeLink(): Link;
        public getSelf(): ActionRepresentation;
        public getUp(): DomainObjectRepresentation;
        public getInvoke(): ActionResultRepresentation;
        public actionId(): string;
        private parameterMap;
        private initParameterMap();
        public parameters(): ParameterMap;
        public disabledReason(): string;
    }
    interface ListOrCollection {
        value(): Links;
    }
    class PromptRepresentation extends ResourceRepresentation {
        public selfLink(): Link;
        public upLink(): Link;
        public getSelf(): PromptRepresentation;
        public getUp(): DomainObjectRepresentation;
        public instanceId(): string;
        public choices(): ValueMap;
        public reset(): void;
        public setSearchTerm(term: string): void;
        public setArgument(name: string, val: Value): void;
        public setArguments(args: ValueMap): void;
    }
    class CollectionRepresentation extends ResourceRepresentation implements ListOrCollection {
        public selfLink(): Link;
        public upLink(): Link;
        public addToLink(): Link;
        public removeFromLink(): Link;
        public getSelf(): CollectionRepresentation;
        public getUp(): DomainObjectRepresentation;
        public setFromMap(map: AddToRemoveFromMap): void;
        private addToMap();
        public getAddToMap(): AddToRemoveFromMap;
        private removeFromMap();
        public getRemoveFromMap(): AddToRemoveFromMap;
        public instanceId(): string;
        public value(): Links;
        public disabledReason(): string;
    }
    class PropertyRepresentation extends ResourceRepresentation {
        public modifyLink(): Link;
        public clearLink(): Link;
        public selfLink(): Link;
        public upLink(): Link;
        public promptLink(): Link;
        private modifyMap();
        public getSelf(): PropertyRepresentation;
        public getUp(): DomainObjectRepresentation;
        public setFromModifyMap(map: ModifyMap): void;
        public getModifyMap(): ModifyMap;
        public getClearMap(): ClearMap;
        public getPrompts(): PromptRepresentation;
        public instanceId(): string;
        public value(): Value;
        public choices(): ValueMap;
        public disabledReason(): string;
        public isScalar(): boolean;
        public hasPrompt(): boolean;
    }
    class Member extends NestedRepresentation {
        public parent: DomainObjectRepresentation;
        constructor(wrapped: any, parent: DomainObjectRepresentation);
        public update(newValue: any): void;
        public memberType(): string;
        public detailsLink(): Link;
        public disabledReason(): string;
        public isScalar(): boolean;
        static WrapMember(toWrap: any, parent: any): Member;
    }
    class PropertyMember extends Member {
        constructor(wrapped: any, parent: any);
        public value(): Value;
        public update(newValue: any): void;
        public attachmentLink(): Link;
        public promptLink(): Link;
        public getDetails(): PropertyRepresentation;
        public hasChoices(): boolean;
        public hasPrompt(): boolean;
        public choices(): ValueMap;
    }
    class CollectionMember extends Member {
        constructor(wrapped: any, parent: any);
        public value(): DomainObjectRepresentation[];
        public size(): number;
        public getDetails(): CollectionRepresentation;
    }
    class ActionMember extends Member {
        constructor(wrapped: any, parent: any);
        public getDetails(): ActionRepresentation;
    }
    interface MemberMap {
        [index: string]: Member;
    }
    interface PropertyMemberMap {
        [index: string]: PropertyMember;
    }
    interface CollectionMemberMap {
        [index: string]: CollectionMember;
    }
    interface ActionMemberMap {
        [index: string]: ActionMember;
    }
    class DomainObjectRepresentation extends ResourceRepresentation {
        constructor(object?: any);
        public getUrl(): string;
        public title(): string;
        public domainType(): string;
        public serviceId(): string;
        public links(): Links;
        public instanceId(): string;
        public extensions(): Extensions;
        private memberMap;
        private propertyMemberMap;
        private collectionMemberMap;
        private actionMemberMap;
        private resetMemberMaps();
        private initMemberMaps();
        public members(): MemberMap;
        public propertyMembers(): PropertyMemberMap;
        public collectionMembers(): CollectionMemberMap;
        public actionMembers(): ActionMemberMap;
        public member(id: string): Member;
        public propertyMember(id: string): PropertyMember;
        public collectionMember(id: string): CollectionMember;
        public actionMember(id: string): ActionMember;
        public updateLink(): Link;
        public persistLink(): Link;
        public selfLink(): Link;
        private updateMap();
        private persistMap();
        public getSelf(): DomainObjectRepresentation;
        public getPersistMap(): PersistMap;
        public getUpdateMap(): UpdateMap;
        public setFromUpdateMap(map: UpdateMap): void;
        public setFromPersistMap(map: PersistMap): void;
        public preFetch(): void;
    }
    class ScalarValueRepresentation extends NestedRepresentation {
        constructor(wrapped: any);
        public value(): Value;
    }
    class ListRepresentation extends ResourceRepresentation implements ListOrCollection {
        constructor(object?: any);
        public selfLink(): Link;
        public getSelf(): ListRepresentation;
        public value(): Links;
    }
    class ErrorRepresentation extends ResourceRepresentation {
        constructor(object?: any);
        public message(): string;
        public stacktrace(): string[];
        public causedBy(): ErrorRepresentation;
    }
    class PersistMap extends ArgumentMap implements HateoasModel {
        private domainObject;
        constructor(domainObject: DomainObjectRepresentation, map: Object);
        public onChange(): void;
        public onError(map: Object, statusCode: string, warnings: string): ErrorMap;
        public setMember(name: string, value: Value): void;
    }
    class VersionRepresentation extends ResourceRepresentation {
        constructor();
        public selfLink(): Link;
        public upLink(): Link;
        public getSelf(): VersionRepresentation;
        public getUp(): HomePageRepresentation;
        public specVersion(): string;
        public implVersion(): string;
        public optionalCapabilities(): OptionalCapabilities;
    }
    class DomainServicesRepresentation extends ListRepresentation {
        public upLink(): Link;
        public getSelf(): DomainServicesRepresentation;
        public getUp(): HomePageRepresentation;
    }
    class UserRepresentation extends ResourceRepresentation {
        public selfLink(): Link;
        public upLink(): Link;
        public getSelf(): UserRepresentation;
        public getUp(): HomePageRepresentation;
        public userName(): string;
        public friendlyName(): string;
        public email(): string;
        public roles(): string[];
    }
    class HomePageRepresentation extends ResourceRepresentation {
        constructor();
        public serviceLink(): Link;
        public userLink(): Link;
        public selfLink(): Link;
        public versionLink(): Link;
        public getSelf(): HomePageRepresentation;
        public getUser(): UserRepresentation;
        public getDomainServices(): DomainServicesRepresentation;
        public getVersion(): VersionRepresentation;
    }
    class Link extends ModelShim {
        constructor(object?: any);
        public href(): string;
        public method(): string;
        public rel(): Rel;
        public type(): MediaType;
        public title(): string;
        public arguments(): Object;
        public extensions(): Extensions;
        public copyToHateoasModel(hateoasModel: HateoasModel): void;
        private getHateoasTarget(targetType);
        private repTypeToModel;
        public getTarget(): HateoasModel;
    }
}
