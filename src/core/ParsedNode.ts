import {IParsedNode} from '../types';

export class ParsedNode implements IParsedNode {
	default = '';
	hasTypeKeyword = false;
	namedImports = [];
	namespace = '';
	path = '';
	multilineImport = false;

	getKeyByImportPath(): string {
		return `type:${this.hasTypeKeyword}@path:${this.path}`;
	}

}
