import {Literal} from '../types';
import {Parser} from './Parser';
import type {INamedImport, IParsedNode} from '../types';

export class ParsedNode implements IParsedNode {
	default = '';
	hasTypeKeyword = false;
	namedImports = [];
	namespace = '';
	path = '';
	multilineImport = false;
	parser: Parser;

	constructor(parser: Parser) {
		this.parser = parser;
	}

	getKeyByImportPath(): string {
		return `type:${this.hasTypeKeyword}@path:${this.path}`;
	}

	toString(): string {
		let result = `${Literal.Import} `;

		if (this.hasTypeKeyword) {
			result += `${Literal.Type} `;
		}

		if (this.default) {
			result += this.default;
		}
		else if (!this.namedImports && this.namespace) {
			result += `${Literal.All} ${Literal.As} ${this.namespace}`;
		}
		else if (this.namedImports && this.namedImports) {
			const
				lenghtOfNamedImports = this.namedImports.length;

			result += Literal.BracketOpen;

			if (this.multilineImport) {
				result += '\n';
			}

			this.namedImports.forEach((namedImport: INamedImport, index: number) => {
				if (this.multilineImport) {
					result += this.parser.getConfiguration().tabsIndentation ? '\t' : ' ';
				}
				result += namedImport.importName;

				if (namedImport.alias) {
					result += ` ${Literal.As} ${namedImport.alias}`;
				}

				if (index < lenghtOfNamedImports - 1) {
					result += `${Literal.ImportSeparator}${this.multilineImport ? '' : ' '}`;
				}

				if (this.multilineImport) {
					result += '\n';
				}
			});
			result += Literal.BracketClose;
		}

		result += this.getOutputPath();

		result += '\n';

		return result;
	}

	getOutputPath(): string {
		const
			configuration = this.parser.getConfiguration();

		let
			result = '';

		if (this.namespace || this.namedImports || this.default) {
			result += ` ${Literal.From} `
		}

		result += `${configuration.quoteSymbol}${this.path}${configuration.quoteSymbol}`;

		if (configuration.useSemicolon) {
			result += Literal.Semicolon;
		}

		return result;
	}

}
