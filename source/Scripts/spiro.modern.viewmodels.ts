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


module Spiro.Angular.Modern {


    export class AttachmentViewModel {
        href: string;
        mimeType: string;
        title: string;

        static create(href : string, mimeType : string, title : string) {
            const attachmentViewModel = new AttachmentViewModel();
            attachmentViewModel.href = href;
            attachmentViewModel.mimeType = mimeType;
            attachmentViewModel.title = title || "UnknownFile";

            return attachmentViewModel;
        }
    }

    export class ChoiceViewModel {
        id: string; 
        name: string;
        value: string;
        search: string; 
        isEnum : boolean; 

        static create(value: Value, id : string, name? : string, searchTerm? : string) {
            const choiceViewModel = new ChoiceViewModel();
            choiceViewModel.id = id;
            choiceViewModel.name = name || value.toString(); 
            choiceViewModel.value = value.isReference() ? value.link().href() : value.toValueString();
            choiceViewModel.search = searchTerm || choiceViewModel.name; 

            choiceViewModel.isEnum = !value.isReference() && (choiceViewModel.name !== choiceViewModel.value);
            return choiceViewModel;
        } 

        equals(other: ChoiceViewModel) {
            return this.id === other.id &&
                   this.name === other.name &&
                   this.value === other.value;
        }

        match(other: ChoiceViewModel) {
            const thisValue = this.isEnum ? this.value.trim() : this.search.trim();
            const otherValue = this.isEnum ? other.value.trim() : other.search.trim();
            return thisValue === otherValue; 
        }

    }

    export class ErrorViewModel {
        message: string;
        stackTrace: string[];   
    } 

    export class LinkViewModel {
        title: string;
        color: string;
        doClick : () => void;
    }

    export class ItemViewModel {
        title: string;
        color: string;
        target: DomainObjectViewModel;
        doClick: () => void;
    }

    export class MessageViewModel {
     
        message: string;
       
        clearMessage() {
            this.message = "";
        }
    }

    export class ValueViewModel extends MessageViewModel {
        value: Object;    
        id: string; 
        argId: string; 
        choices: ChoiceViewModel[];
        hasChoices: boolean;
        hasPrompt: boolean; 
        hasConditionalChoices: boolean;
        type: string;
        reference: string;
        choice: ChoiceViewModel; 
        multiChoices: ChoiceViewModel[]; 
        returnType: string;
        title: string;
        format: string;
        arguments: IValueMap; 
        mask: string;
        isMultipleChoices: boolean; 
        minLength: number;
        hasAutoAutoComplete : boolean;

        setSelectedChoice() {}

        prompt(searchTerm: string): ng.IPromise<ChoiceViewModel[]> {
            return null;
        }

        conditionalChoices(args: IValueMap): ng.IPromise<ChoiceViewModel[]> {
            return null;
        }

        getMemento(): string {
            if (this.hasChoices) {
                if (this.isMultipleChoices) {
                    const ss = _.map(this.multiChoices, (c) => {
                        return c.search;
                    });

                    if (ss.length === 0) {
                        return "";
                    }

                    return _.reduce(ss, (m: string, s) => {
                        return m + "-" + s;
                    });
                } 

                return (this.choice && this.choice.search) ? this.choice.search : this.getValue().toString(); 
            }

            return this.getValue().toString();
        }

        getValue(): Value {
           
            if (this.hasChoices || this.hasPrompt || this.hasConditionalChoices || this.hasAutoAutoComplete) {

                if (this.isMultipleChoices) {
                    const selections = this.multiChoices || [];
                    if (this.type === "scalar") {
                        const selValues = _.map(selections, (cvm: ChoiceViewModel) => cvm.value);
                        return new Value(selValues);
                    }
                    const selRefs = _.map(selections, (cvm: ChoiceViewModel) => {
                        return { href: cvm.value, title: cvm.name };
                    }); // reference 
                    return new Value(selRefs);
                }


                if (this.type === "scalar") {
                    return new Value(this.choice && this.choice.value != null ? this.choice.value : "");
                }

                // reference 
                return new Value(this.choice && this.choice.value ? { href: this.choice.value, title: this.choice.name } : null );
            }

            if (this.type === "scalar") {
                return new Value(this.value == null ? "" : this.value);
            }

            // reference
            return new Value(this.reference ? { href: this.reference } : null);
        }

    }

    export class ParameterViewModel extends ValueViewModel{
        dflt: string;       
    } 

    export class ActionViewModel {
        menuPath : string;
        title: string;
        doInvoke : () => void;
    } 

    export class DialogViewModel extends MessageViewModel {

        title: string;
        message: string;
        isQuery: boolean;

        parameters: ParameterViewModel[];

        doClose: () => void;
        doInvoke: () => void;

        clearMessages() {
            this.message = "";
            _.each(this.parameters, parm => parm.clearMessage());
        }
    } 
    
    export class PropertyViewModel extends ValueViewModel {

        target: string;
        color: string;       
        isEditable: boolean;    
        attachment: AttachmentViewModel;

        doClick() : void { }
    } 

    export class CollectionViewModel {
        title: string;
        size: number;
        pluralName: string;
        color: string; 
        items: ItemViewModel[];
        header: string[];

        doSummary(): void { }
        doTable(): void { }
        doList(): void { }

        template: string;
    } 

    export class ServicesViewModel {
        title: string; 
        color: string; 
        items: LinkViewModel[];       
    } 

    export class MenusViewModel {
        title: string;
        color: string;
        items: LinkViewModel[];
    } 

    export class ServiceViewModel {
        title: string;
        serviceId: string;
        actions: ActionViewModel[];
        color: string; 
    } 

    export class MenuViewModel {
        title: string;
        actions: ActionViewModel[];
        color: string;
    } 


    export class DomainObjectViewModel extends MessageViewModel{
        title: string;
        domainType: string; 
        properties: PropertyViewModel[];
        collections: CollectionViewModel[];
        actions: ActionViewModel[];
        color: string; 
        doSave(): void { }
        toggleActionMenu(): void { }
        isTransient : boolean;

        doEdit(): void { }
        doEditCancel(): void { }

        showEdit(): boolean {
            return  !this.isTransient &&  _.any(this.properties, (p) => p.isEditable);
        }
    }

    export class AppBarViewModel {
        loading: string;
        template: string;
        footerTemplate: string;
        goHome: string;
        goBack: () => void;
        goForward: () => void;
        hideEdit: () => boolean;
        doEdit: () => void;
    }
}