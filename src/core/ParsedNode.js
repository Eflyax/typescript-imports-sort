"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedNode = void 0;
var types_1 = require("../types");
var ParsedNode = /** @class */ (function () {
    function ParsedNode(parser) {
        this.default = '';
        this.hasTypeKeyword = false;
        this.namedImports = [];
        this.namespace = '';
        this.path = '';
        this.multilineImport = false;
        this.parser = parser;
    }
    ParsedNode.prototype.getKeyByImportPath = function () {
        return "type:".concat(this.hasTypeKeyword, "@path:").concat(this.path);
    };
    ParsedNode.prototype.toString = function () {
        var _this = this;
        var result = "".concat(types_1.Literal.Import, " ");
        if (this.hasTypeKeyword) {
            result += "".concat(types_1.Literal.Type, " ");
        }
        if (this.default) {
            result += this.default;
        }
        else if (!this.namedImports && this.namespace) {
            result += "".concat(types_1.Literal.All, " ").concat(types_1.Literal.As, " ").concat(this.namespace);
        }
        else if (this.namedImports && this.namedImports) {
            var lenghtOfNamedImports_1 = this.namedImports.length;
            result += types_1.Literal.BracketOpen;
            if (this.multilineImport) {
                result += '\n';
            }
            this.namedImports.forEach(function (namedImport, index) {
                if (_this.multilineImport) {
                    result += _this.parser.getConfiguration().tabsIndentation ? '\t' : ' ';
                }
                result += namedImport.importName;
                if (namedImport.alias) {
                    result += " ".concat(types_1.Literal.As, " ").concat(namedImport.alias);
                }
                if (index < lenghtOfNamedImports_1 - 1) {
                    result += "".concat(types_1.Literal.ImportSeparator).concat(_this.multilineImport ? '' : ' ');
                }
                if (_this.multilineImport) {
                    result += '\n';
                }
            });
            result += types_1.Literal.BracketClose;
        }
        result += this.getOutputPath();
        result += '\n';
        return result;
    };
    ParsedNode.prototype.getOutputPath = function () {
        var configuration = this.parser.getConfiguration();
        var result = '';
        if (this.namespace || this.namedImports || this.default) {
            result += " ".concat(types_1.Literal.From, " ");
        }
        result += "".concat(configuration.quoteSymbol).concat(this.path).concat(configuration.quoteSymbol);
        if (configuration.useSemicolon) {
            result += types_1.Literal.Semicolon;
        }
        return result;
    };
    return ParsedNode;
}());
exports.ParsedNode = ParsedNode;
