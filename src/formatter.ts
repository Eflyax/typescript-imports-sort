import {configuration} from './configuration';
import {Parser} from './core/Parser';
import {IConfiguration} from './types';
import * as fs from 'fs';

function getConfiguration(): IConfiguration {
	const
		extensionConfiguration = configuration;

	return {
		tabsIndentation: extensionConfiguration.tabsIndentation,
		maximumLineLength: extensionConfiguration.maxCharactersInSingleLine,
		quoteSymbol: extensionConfiguration.quoteStyle === 'single' ? `'` : `"`,
		spaceAroundBrackets: extensionConfiguration.spaceAroundBrackets,
		useSemicolon: extensionConfiguration.useSemicolon
	} as IConfiguration;
}

try {

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

		const
			substring = '    ',
			replacement = '\t';

		result = result.replace(new RegExp(substring, 'g'), replacement);

		console.log(result);
	});
}
catch (error) {
	console.error(error);
}
