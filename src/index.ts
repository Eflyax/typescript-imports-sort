import {Parser} from './Parser';
import fs from 'fs';

const
	parser = new Parser(),
	fileInput = fs.readFileSync(__dirname + '/input.ts', 'utf-8'),
	nodes = parser.parseImportNodes(fileInput);

for (const node of nodes) {
	console.log(node);
}
