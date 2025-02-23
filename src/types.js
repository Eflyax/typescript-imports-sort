"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsedNodeGroup = exports.Literal = exports.ParsedGroup = void 0;
var ParsedGroup;
(function (ParsedGroup) {
    ParsedGroup[ParsedGroup["Alias"] = 5] = "Alias";
    ParsedGroup[ParsedGroup["DefaultImport"] = 6 || 19] = "DefaultImport";
    ParsedGroup[ParsedGroup["DestructingImportGroup"] = 7 || 20] = "DestructingImportGroup";
    ParsedGroup[ParsedGroup["FilePath"] = 32] = "FilePath";
    ParsedGroup[ParsedGroup["ImportName"] = 2] = "ImportName";
    ParsedGroup[ParsedGroup["InlineComment"] = 33] = "InlineComment";
    ParsedGroup[ParsedGroup["NamespaceImport"] = 4] = "NamespaceImport";
    ParsedGroup[ParsedGroup["TypeKeyword"] = 1] = "TypeKeyword";
})(ParsedGroup || (exports.ParsedGroup = ParsedGroup = {}));
var Literal;
(function (Literal) {
    Literal["All"] = "*";
    Literal["As"] = "as";
    Literal["BracketClose"] = "}";
    Literal["BracketOpen"] = "{";
    Literal["From"] = "from";
    Literal["Import"] = "import";
    Literal["ImportSeparator"] = ",";
    Literal["Semicolon"] = ";";
    Literal["Type"] = "type";
})(Literal || (exports.Literal = Literal = {}));
var ParsedNodeGroup;
(function (ParsedNodeGroup) {
    ParsedNodeGroup["Other"] = "other";
    ParsedNodeGroup["WithDefaultImport"] = "withDefaultImport";
    ParsedNodeGroup["WithNamedImport"] = "withNamedImport";
    ParsedNodeGroup["WithoutNamedImport"] = "withoutNamedImport";
    ParsedNodeGroup["WithTypeKeyword"] = "withTypeKeyword";
})(ParsedNodeGroup || (exports.ParsedNodeGroup = ParsedNodeGroup = {}));
