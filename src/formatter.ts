import {configuration} from './configuration';
import {Parser} from './core/Parser';
import {IConfiguration} from './core/IConfiguration';
import fs from 'fs';

function getConfiguration(): IConfiguration {
	const
		extensionConfiguration = configuration;

	return {
		tabsIndentation: extensionConfiguration.tabsIndentation,
		maximumLineLength: extensionConfiguration.maxCharactersInSingleLine,
		quoteSymbol: extensionConfiguration.quoteStyle === 'single' ? `'`: `"`,
		spaceAroundBrackets: extensionConfiguration.spaceAroundBrackets,
		useSemicolon: extensionConfiguration.useSemicolon
	} as IConfiguration;
}

const
	pathToFile = process.argv[2];

fs.readFile(pathToFile, 'utf8', (err, fileContent: string) => {
	if (err) {
		throw err;
	}

	const
		parser = new Parser(getConfiguration());

	let
		result = parser.getOutputForSource(fileContent);

	result = result.replaceAll('    ', '\t');

	console.log(result);
});
