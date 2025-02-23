"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sorter = void 0;
var types_1 = require("../types");
var Sorter = /** @class */ (function () {
    function Sorter() {
    }
    Sorter.prototype.sortNodes = function (nodes) {
        var _a;
        var _this = this;
        var nodeGroups = (_a = {},
            _a[types_1.ParsedNodeGroup.WithNamedImport] = [],
            _a[types_1.ParsedNodeGroup.WithDefaultImport] = [],
            _a[types_1.ParsedNodeGroup.WithoutNamedImport] = [],
            _a[types_1.ParsedNodeGroup.WithTypeKeyword] = [],
            _a[types_1.ParsedNodeGroup.Other] = [],
            _a);
        nodes.forEach(function (node) {
            if (node.namedImports) {
                node.namedImports.sort(_this.compareNamedImports);
            }
            if (node.hasTypeKeyword) {
                nodeGroups[types_1.ParsedNodeGroup.WithTypeKeyword].push(node);
                nodeGroups[types_1.ParsedNodeGroup.WithTypeKeyword].sort(_this.compareNodesWithTypeKeyword);
            }
            else if (node.namedImports) {
                nodeGroups[types_1.ParsedNodeGroup.WithNamedImport].push(node);
                nodeGroups[types_1.ParsedNodeGroup.WithNamedImport].sort(_this.compareNodesWithNamedImports);
            }
            else if (node.default) {
                nodeGroups[types_1.ParsedNodeGroup.WithDefaultImport].push(node);
                nodeGroups[types_1.ParsedNodeGroup.WithDefaultImport].sort(_this.compareNodesWithDefaultImport);
            }
            else if (!node.namespace) {
                nodeGroups[types_1.ParsedNodeGroup.Other].push(node);
            }
            else {
                nodeGroups[types_1.ParsedNodeGroup.WithoutNamedImport].push(node);
                nodeGroups[types_1.ParsedNodeGroup.WithoutNamedImport].sort(_this.compareNodesWithoutNamedImport);
            }
        });
        var result = [];
        for (var key in nodeGroups) {
            nodeGroups[key].forEach(function (parsedNode) {
                result.push(parsedNode);
            });
        }
        return result;
    };
    Sorter.prototype.compareNodesWithNamedImports = function (objectA, objectB) {
        function chainNamedImports(namedImports) {
            var result = '';
            namedImports.forEach(function (namedImport) { return result += namedImport.importName; });
            return result;
        }
        var importNameA = chainNamedImports(objectA.namedImports).toUpperCase(), importNameB = chainNamedImports(objectB.namedImports).toUpperCase();
        return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
    };
    Sorter.prototype.compareNodesWithoutNamedImport = function (objectA, objectB) {
        var importNameA = objectA.namespace.toUpperCase(), importNameB = objectB.namespace.toUpperCase();
        return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
    };
    Sorter.prototype.compareNodesWithDefaultImport = function (objectA, objectB) {
        var importNameA = objectA.default.toUpperCase(), importNameB = objectB.default.toUpperCase();
        return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
    };
    Sorter.prototype.compareNodesWithTypeKeyword = function (objectA, objectB) {
        var _a, _b;
        var namedImportsA = ((_a = objectA.namedImports) === null || _a === void 0 ? void 0 : _a.length) ? 1 : 0, namedImportsB = ((_b = objectB.namedImports) === null || _b === void 0 ? void 0 : _b.length) ? 1 : 0;
        return (namedImportsA < namedImportsB) ? 1 : (namedImportsA > namedImportsB) ? -1 : 0;
    };
    Sorter.prototype.compareNamedImports = function (objectA, objectB) {
        var importNameA = objectA.importName.toUpperCase(), importNameB = objectB.importName.toUpperCase();
        return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
    };
    return Sorter;
}());
exports.Sorter = Sorter;
