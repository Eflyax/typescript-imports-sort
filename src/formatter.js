"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configuration_1 = require("./configuration");
var Parser_1 = require("./core/Parser");
var fs = require("fs");
function getConfiguration() {
    var extensionConfiguration = configuration_1.configuration;
    return {
        tabsIndentation: extensionConfiguration.tabsIndentation,
        maximumLineLength: extensionConfiguration.maxCharactersInSingleLine,
        quoteSymbol: extensionConfiguration.quoteStyle === 'single' ? "'" : "\"",
        spaceAroundBrackets: extensionConfiguration.spaceAroundBrackets,
        useSemicolon: extensionConfiguration.useSemicolon
    };
}
try {
    var pathToFile = process.argv[2];
    fs.readFile(pathToFile, 'utf8', function (err, fileContent) {
        if (err) {
            throw err;
        }
        var parser = new Parser_1.Parser(getConfiguration());
        var result = parser.getOutputForSource(fileContent);
        var substring = '    ', replacement = '\t';
        result = result.replace(new RegExp(substring, 'g'), replacement);
        console.log(result);
    });
}
catch (error) {
    console.error(error);
}
