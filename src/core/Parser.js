"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var types_1 = require("../types");
var ParsedNode_1 = require("./ParsedNode");
var Sorter_1 = require("./Sorter");
var Parser = /** @class */ (function () {
    function Parser(configuration) {
        var _this = this;
        this.parsedRange = {
            from: 0,
            to: 0
        };
        this.parsedNodes = {};
        this.parseDestructiveImports = function (destructiveImports) {
            if (!destructiveImports) {
                return null;
            }
            return (destructiveImports)
                .split(',')
                .map(function (destructiveImport) {
                var match = _this.destructingImportTokenRegex.exec(destructiveImport);
                return !match
                    ? null
                    : {
                        alias: match[types_1.ParsedGroup.NamespaceImport],
                        importName: match[types_1.ParsedGroup.TypeKeyword]
                    };
            })
                .filter(function (destructiveImport) { return !!(destructiveImport === null || destructiveImport === void 0 ? void 0 : destructiveImport.importName); });
        };
        this.parseImportNodes = function (source) {
            _this.importRegex.lastIndex = 0;
            if (/(disable-sort-imports)/g.test(source)) {
                return [];
            }
            var match, minParsedRange = source.length, maxParsedRange = 0;
            while ((match = _this.importRegex.exec(source))) {
                var parsedNode = new ParsedNode_1.ParsedNode(_this);
                parsedNode.default = match[types_1.ParsedGroup.DefaultImport];
                parsedNode.hasTypeKeyword = !!match[types_1.ParsedGroup.TypeKeyword];
                parsedNode.namedImports = _this.parseDestructiveImports(match[types_1.ParsedGroup.DestructingImportGroup]);
                parsedNode.namespace = match[types_1.ParsedGroup.NamespaceImport];
                parsedNode.path = match[types_1.ParsedGroup.FilePath];
                parsedNode.multilineImport = parsedNode.toString()
                    .replace(parsedNode.getOutputPath(), '')
                    .length > _this.configuration.maximumLineLength;
                var nodeKey = parsedNode.getKeyByImportPath();
                if (_this.parsedNodes[nodeKey]) {
                    _this.parsedNodes[nodeKey].namedImports = [].concat(_this.parsedNodes[nodeKey].namedImports, parsedNode.namedImports);
                }
                else {
                    _this.parsedNodes[nodeKey] = parsedNode;
                }
                if (match.index < minParsedRange) {
                    minParsedRange = match.index;
                }
                if (_this.importRegex.lastIndex > maxParsedRange) {
                    maxParsedRange = _this.importRegex.lastIndex;
                }
            }
            _this.parsedRange.from = minParsedRange;
            _this.parsedRange.to = maxParsedRange;
            var imports = [];
            for (var key in _this.parsedNodes) {
                imports.push(_this.parsedNodes[key]);
            }
            return _this.sorter.sortNodes(imports);
        };
        this.initRegex();
        this.configuration = configuration;
        this.sorter = new Sorter_1.Sorter();
    }
    Parser.prototype.initRegex = function () {
        var name = "((?!\\d)(?:(?!\\s)[$\\w\\u0080-\\uFFFF]|\\\\u[\\da-fA-F]{4}|\\\\u\\{[\\da-fA-F]+\\})+)", ws = "\\s", spaceNoReturns = "[^\\S\\r\\n]", namespaceToken = "\\*\\s+as\\s+(".concat(name, ")"), defaultImportToken = name, destructingImportToken = "(".concat(name, ")(\\s+as\\s+(").concat(name, "))?"), destructingImport = "{(".concat(ws, "*").concat(destructingImportToken, "(").concat(ws, "*,").concat(ws, "*").concat(destructingImportToken, ")*").concat(ws, "*,?").concat(ws, "*)}"), defaultAndDestructingImport = "".concat(defaultImportToken).concat(ws, "*,").concat(ws, "*").concat(destructingImport), combinedImportTypes = "(".concat(namespaceToken, "|").concat(defaultImportToken, "|").concat(destructingImport, "|").concat(defaultAndDestructingImport, ")"), inlineComment = "(".concat(spaceNoReturns, "*[\\/]{2}.*)?"), importRegexString = "^import(\\s+type)?\\s+(".concat(combinedImportTypes, "\\s+from\\s+)?['\"]([~@#:\\w\\\\/.-]+)['\"];?").concat(inlineComment, "\\r?\\n?");
        this.importRegex = new RegExp(importRegexString, 'gm');
        this.destructingImportTokenRegex = new RegExp(destructingImportToken);
    };
    Parser.prototype.getOutputForSource = function (source) {
        var nodes = this.parseImportNodes(source);
        if (!nodes.length) {
            return '';
        }
        var sortedNodes = '';
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            sortedNodes += node.toString();
        }
        var contentBeforeImports = source.slice(0, this.parsedRange.from), contentAfterImports = source.slice(this.parsedRange.to, source.length);
        return contentBeforeImports + sortedNodes + contentAfterImports;
    };
    Parser.prototype.getConfiguration = function () {
        return this.configuration;
    };
    return Parser;
}());
exports.Parser = Parser;
