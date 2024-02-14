import {parseImportNodes} from './Parser';
import fs from 'fs';

const
	fileInput = fs.readFileSync(__dirname + '/input.ts', 'utf-8'),
	nodes = parseImportNodes(fileInput);

for (const node of nodes) {
	console.log(node);
}
