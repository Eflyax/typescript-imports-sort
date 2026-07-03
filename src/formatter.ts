import {formatDocument} from './formatDocument';
import * as fs from 'fs';

const filePath = process.argv[2];

if (!filePath) {
	process.stderr.write('Usage: formatter.ts <file-path>\n');
	process.exit(1);
}

let content: string;
const stdin = fs.readFileSync(0, 'utf-8');
if (stdin) {
	content = stdin;
} else {
	try {
		content = fs.readFileSync(filePath, 'utf-8');
	} catch (e) {
		process.stderr.write(`Cannot read file: ${filePath}\n`);
		process.exit(1);
	}
}

process.stdout.write(formatDocument(content, filePath));
