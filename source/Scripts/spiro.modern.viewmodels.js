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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="typings/angularjs/angular.d.ts" />
/// <reference path="spiro.models.ts" />
var Spiro;
(function (Spiro) {
    var Angular;
    (function (Angular) {
        var Modern;
        (function (Modern) {
            var AttachmentViewModel = (function () {
                function AttachmentViewModel() {
                }
                AttachmentViewModel.create = function (href, mimeType, title) {
                    var attachmentViewModel = new AttachmentViewModel();
                    attachmentViewModel.href = href;
                    attachmentViewModel.mimeType = mimeType;
                    attachmentViewModel.title = title || "UnknownFile";
                    return attachmentViewModel;
                };
                return AttachmentViewModel;
            })();
            Modern.AttachmentViewModel = AttachmentViewModel;
            var ChoiceViewModel = (function () {
                function ChoiceViewModel() {
                }
                ChoiceViewModel.create = function (value, id, name, searchTerm) {
                    var choiceViewModel = new ChoiceViewModel();
                    choiceViewModel.id = id;
                    choiceViewModel.name = name || value.toString();
                    choiceViewModel.value = value.isReference() ? value.link().href() : value.toValueString();
                    choiceViewModel.search = searchTerm || choiceViewModel.name;
                    choiceViewModel.isEnum = !value.isReference() && (choiceViewModel.name !== choiceViewModel.value);
                    return choiceViewModel;
                };
                ChoiceViewModel.prototype.equals = function (other) {
                    return this.id === other.id &&
                        this.name === other.name &&
                        this.value === other.value;
                };
                ChoiceViewModel.prototype.match = function (other) {
                    var thisValue = this.isEnum ? this.value.trim() : this.search.trim();
                    var otherValue = this.isEnum ? other.value.trim() : other.search.trim();
                    return thisValue === otherValue;
                };
                return ChoiceViewModel;
            })();
            Modern.ChoiceViewModel = ChoiceViewModel;
            var ErrorViewModel = (function () {
                function ErrorViewModel() {
                }
                return ErrorViewModel;
            })();
            Modern.ErrorViewModel = ErrorViewModel;
            var LinkViewModel = (function () {
                function LinkViewModel() {
                }
                return LinkViewModel;
            })();
            Modern.LinkViewModel = LinkViewModel;
            var ItemViewModel = (function (_super) {
                __extends(ItemViewModel, _super);
                function ItemViewModel() {
                    _super.apply(this, arguments);
                }
                return ItemViewModel;
            })(LinkViewModel);
            Modern.ItemViewModel = ItemViewModel;
            var MessageViewModel = (function () {
                function MessageViewModel() {
                }
                MessageViewModel.prototype.clearMessage = function () {
                    this.message = "";
                };
                return MessageViewModel;
            })();
            Modern.MessageViewModel = MessageViewModel;
            var ValueViewModel = (function (_super) {
                __extends(ValueViewModel, _super);
                function ValueViewModel() {
                    _super.apply(this, arguments);
                }
                ValueViewModel.prototype.setSelectedChoice = function () { };
                ValueViewModel.prototype.prompt = function (searchTerm) {
                    return null;
                };
                ValueViewModel.prototype.conditionalChoices = function (args) {
                    return null;
                };
                ValueViewModel.prototype.getMemento = function () {
                    if (this.hasChoices) {
                        if (this.isMultipleChoices) {
                            var ss = _.map(this.multiChoices, function (c) {
                                return c.search;
                            });
                            if (ss.length === 0) {
                                return "";
                            }
                            return _.reduce(ss, function (m, s) {
                                return m + "-" + s;
                            });
                        }
                        return (this.choice && this.choice.search) ? this.choice.search : this.getValue().toString();
                    }
                    return this.getValue().toString();
                };
                ValueViewModel.prototype.getValue = function () {
                    if (this.hasChoices || this.hasPrompt || this.hasConditionalChoices || this.hasAutoAutoComplete) {
                        if (this.isMultipleChoices) {
                            var selections = this.multiChoices || [];
                            if (this.type === "scalar") {
                                var selValues = _.map(selections, function (cvm) { return cvm.value; });
                                return new Spiro.Value(selValues);
                            }
                            var selRefs = _.map(selections, function (cvm) {
                                return { href: cvm.value, title: cvm.name };
                            }); // reference 
                            return new Spiro.Value(selRefs);
                        }
                        if (this.type === "scalar") {
                            return new Spiro.Value(this.choice && this.choice.value != null ? this.choice.value : "");
                        }
                        // reference 
                        return new Spiro.Value(this.choice && this.choice.value ? { href: this.choice.value, title: this.choice.name } : null);
                    }
                    if (this.type === "scalar") {
                        return new Spiro.Value(this.value == null ? "" : this.value);
                    }
                    // reference
                    return new Spiro.Value(this.reference ? { href: this.reference } : null);
                };
                return ValueViewModel;
            })(MessageViewModel);
            Modern.ValueViewModel = ValueViewModel;
            var ParameterViewModel = (function (_super) {
                __extends(ParameterViewModel, _super);
                function ParameterViewModel() {
                    _super.apply(this, arguments);
                }
                return ParameterViewModel;
            })(ValueViewModel);
            Modern.ParameterViewModel = ParameterViewModel;
            var ActionViewModel = (function () {
                function ActionViewModel() {
                }
                return ActionViewModel;
            })();
            Modern.ActionViewModel = ActionViewModel;
            var DialogViewModel = (function (_super) {
                __extends(DialogViewModel, _super);
                function DialogViewModel() {
                    _super.apply(this, arguments);
                }
                DialogViewModel.prototype.clearMessages = function () {
                    this.message = "";
                    _.each(this.parameters, function (parm) { return parm.clearMessage(); });
                };
                return DialogViewModel;
            })(MessageViewModel);
            Modern.DialogViewModel = DialogViewModel;
            var PropertyViewModel = (function (_super) {
                __extends(PropertyViewModel, _super);
                function PropertyViewModel() {
                    _super.apply(this, arguments);
                }
                PropertyViewModel.prototype.doClick = function () { };
                return PropertyViewModel;
            })(ValueViewModel);
            Modern.PropertyViewModel = PropertyViewModel;
            var CollectionViewModel = (function () {
                function CollectionViewModel() {
                }
                CollectionViewModel.prototype.doSummary = function () { };
                CollectionViewModel.prototype.doTable = function () { };
                CollectionViewModel.prototype.doList = function () { };
                return CollectionViewModel;
            })();
            Modern.CollectionViewModel = CollectionViewModel;
            var ServicesViewModel = (function () {
                function ServicesViewModel() {
                }
                return ServicesViewModel;
            })();
            Modern.ServicesViewModel = ServicesViewModel;
            var MenusViewModel = (function () {
                function MenusViewModel() {
                }
                return MenusViewModel;
            })();
            Modern.MenusViewModel = MenusViewModel;
            var ServiceViewModel = (function () {
                function ServiceViewModel() {
                }
                return ServiceViewModel;
            })();
            Modern.ServiceViewModel = ServiceViewModel;
            var MenuViewModel = (function () {
                function MenuViewModel() {
                }
                return MenuViewModel;
            })();
            Modern.MenuViewModel = MenuViewModel;
            var DomainObjectViewModel = (function (_super) {
                __extends(DomainObjectViewModel, _super);
                function DomainObjectViewModel() {
                    _super.apply(this, arguments);
                }
                DomainObjectViewModel.prototype.doSave = function () { };
                DomainObjectViewModel.prototype.toggleActionMenu = function () { };
                DomainObjectViewModel.prototype.doEdit = function () { };
                DomainObjectViewModel.prototype.doEditCancel = function () { };
                DomainObjectViewModel.prototype.showEdit = function () {
                    return !this.isTransient && _.any(this.properties, function (p) { return p.isEditable; });
                };
                return DomainObjectViewModel;
            })(MessageViewModel);
            Modern.DomainObjectViewModel = DomainObjectViewModel;
            var AppBarViewModel = (function () {
                function AppBarViewModel() {
                }
                return AppBarViewModel;
            })();
            Modern.AppBarViewModel = AppBarViewModel;
        })(Modern = Angular.Modern || (Angular.Modern = {}));
    })(Angular = Spiro.Angular || (Spiro.Angular = {}));
})(Spiro || (Spiro = {}));
//# sourceMappingURL=spiro.modern.viewmodels.js.map