import {Parser} from './Parser';
import {Writer} from './Writer';
import fs from 'fs';

const
	parser = new Parser(),
	writer = new Writer(),
	fileInput = fs.readFileSync(__dirname + '/input.ts', 'utf-8'),
	nodes = parser.parseImportNodes(fileInput);

for (const node of nodes) {
	// console.log('');
	// console.log(node);
	console.log(writer.parsedNodeToString(node));
	// console.log('');
}
