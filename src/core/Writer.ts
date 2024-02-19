import {config} from '../config';
import {Literal} from '../types';
import type {INamedImport, IParsedNode} from '../types';

export class Writer {

	parsedNodeToString(parsedNode: IParsedNode): string {
		let result = `${Literal.Import} `;

		if (parsedNode.hasTypeKeyword) {
			result += `${Literal.Type} `;
		}

		if (parsedNode.default) {
			result += parsedNode.default;
		}
		else if (!parsedNode.namedImports && parsedNode.namespace) {
			result += `${Literal.All} ${Literal.As} ${parsedNode.namespace}`;
		}
		else if (parsedNode.namedImports && parsedNode.namedImports) {
			const
				lenghtOfNamedImports = parsedNode.namedImports.length;

			result += Literal.BracketOpen;

			if (parsedNode.multilineImport) {
				result += '\n';
			}

			parsedNode.namedImports.forEach((namedImport: INamedImport, index: number) => {
				if (parsedNode.multilineImport) {
					result += '\t';
				}
				result += namedImport.importName;

				if (namedImport.alias) {
					result += ` ${Literal.As} ${namedImport.alias}`;
				}

				if (index < lenghtOfNamedImports - 1) {
					result += `${Literal.ImportSeparator}${parsedNode.multilineImport ? '' : ' '}`;
				}

				if (parsedNode.multilineImport) {
					result += '\n';
				}
			});
			result += Literal.BracketClose;
		}

		if (parsedNode.namespace || parsedNode.namedImports || parsedNode.default) {
			result += ` ${Literal.From} `
		}

		result += `${config.QuoteSymbol}${parsedNode.path}${config.QuoteSymbol}`;

		if (config.UseSemicolon) {
			result += Literal.Semicolon;
		}

		result += '\n';

		return result;
	}

}
