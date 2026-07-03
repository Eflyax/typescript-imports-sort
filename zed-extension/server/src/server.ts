import {formatDocument} from '../../../src/formatDocument';
import {fileURLToPath} from 'url';

interface IPosition {
	character: number;
	line: number;
}

interface ITextEdit {
	newText: string;
	range: {
		end: IPosition;
		start: IPosition;
	};
}

interface ILspMessage {
	id?: number | string;
	method?: string;
	params?: Record<string, any>;
}

const documents = new Map<string, string>();

export function formatToEdits(text: string, filePath: string): Array<ITextEdit> {
	const formatted = formatDocument(text, filePath);
	if (formatted === text) return [];
	const lines = text.split('\n');
	const end: IPosition = {
		line: lines.length - 1,
		character: lines[lines.length - 1].length
	};
	return [{
		range: {start: {line: 0, character: 0}, end},
		newText: formatted
	}];
}

function send(message: object): void {
	const json = JSON.stringify(message);
	process.stdout.write(`Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n${json}`);
}

function reply(id: number | string, result: unknown): void {
	send({jsonrpc: '2.0', id, result});
}

function handle(message: ILspMessage): void {
	const params = message.params ?? {};
	switch (message.method) {
		case 'initialize':
			reply(message.id!, {capabilities: {textDocumentSync: 1, documentFormattingProvider: true}});
			break;
		case 'textDocument/didOpen':
			documents.set(params.textDocument.uri, params.textDocument.text);
			break;
		case 'textDocument/didChange': {
			const changes = params.contentChanges;
			documents.set(params.textDocument.uri, changes[changes.length - 1].text);
			break;
		}
		case 'textDocument/didClose':
			documents.delete(params.textDocument.uri);
			break;
		case 'textDocument/formatting': {
			const uri = params.textDocument.uri;
			const text = documents.get(uri) ?? '';
			reply(message.id!, formatToEdits(text, fileURLToPath(uri)));
			break;
		}
		case 'shutdown':
			reply(message.id!, undefined);
			break;
		case 'exit':
			process.exit(0);
			break;
		default:
			if (message.id !== undefined) reply(message.id, undefined);
	}
}

let buffer = Buffer.alloc(0);
process.stdin.on('data', (chunk: Buffer) => {
	buffer = Buffer.concat([buffer, chunk]);
	while (true) {
		const headerEnd = buffer.indexOf('\r\n\r\n');
		if (headerEnd === -1) return;
		const header = buffer.slice(0, headerEnd).toString('ascii');
		const match = header.match(/Content-Length: (\d+)/i);
		if (!match) {
			buffer = buffer.slice(headerEnd + 4);
			continue;
		}
		const length = parseInt(match[1], 10);
		const bodyStart = headerEnd + 4;
		if (buffer.length < bodyStart + length) return;
		const body = buffer.slice(bodyStart, bodyStart + length).toString('utf8');
		buffer = buffer.slice(bodyStart + length);
		try {
			handle(JSON.parse(body));
		} catch {
			// ignore malformed frame
		}
	}
});
