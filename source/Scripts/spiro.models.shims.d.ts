declare module Spiro {
    class ModelShim {
        constructor(object?: any);
        public url(): string;
        public attributes: any;
        public get(attributeName: string): any;
        public set(attributeName?: any, value?: any, options?: any): void;
    }
    class HateoasModelBaseShim extends ModelShim {
        constructor(object?: any);
        public hateoasUrl: string;
        public method: string;
        private suffix;
        public url(): string;
        public onError(map: Object, statusCode: string, warnings: string): void;
        public preFetch(): void;
    }
    class ArgumentMap extends HateoasModelBaseShim {
        public id: string;
        constructor(map: Object, parent: any, id: string);
        public onChange(): void;
        public onError(map: Object, statusCode: string, warnings: string): void;
    }
    class CollectionShim {
        constructor(object?: any);
        public url(): any;
        public models: any[];
        public model: new(any: any) => any;
        public add(models: any, options?: any): void;
    }
}
