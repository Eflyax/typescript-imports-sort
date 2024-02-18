import {Parser} from './core/Parser';

const
	parser = new Parser(),
	output = parser.getOutputForSourceFile(__dirname + '/../tests/inputScenarios/scenario3.ts');

console.log(output);
