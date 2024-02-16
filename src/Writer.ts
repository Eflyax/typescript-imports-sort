import {Literal} from './types';
import {config} from './config';
import type {INamedImport, IParsedNode} from './types';

export class Writer {

	parsedNodeToString(parsedNode: IParsedNode): string {
		let result = `${Literal.Import} `;

		if (parsedNode.hasTypeKeyword) {
			result += `${Literal.Type} `;
		}

		if (parsedNode.default) {
			result += parsedNode.default;
		}
		else if (!parsedNode.namedImports) {
			result += `${Literal.AllAs} ${parsedNode.namespace}`;
		}
		else {
			const
				lenghtOfNamedImports = parsedNode.namedImports.length;

			result += Literal.BracketOpen;
			parsedNode.namedImports.forEach((namedImport: INamedImport, index: number) => {
				result += namedImport.importName;

				if (index < lenghtOfNamedImports - 1) {
					result += `${Literal.ImportSeparator} `;
				}
			});
			result += Literal.BracketClose;
		}

		result += ` ${Literal.From} ${config.QuoteSymbol}${parsedNode.path}${config.QuoteSymbol}`;

		if (config.UseSemicolon) {
			result += Literal.Semicolon;
		}

		return result;
	}

}
