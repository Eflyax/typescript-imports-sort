import {Parser} from './core/Parser';

const
	parser = new Parser(),
	output = parser.getOutputForSourceFile(__dirname + '/input.ts');

console.log(output);
