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
		else if (!parsedNode.namedImports) {
			result += `${Literal.All} ${Literal.As} ${parsedNode.namespace}`;
		}
		else {
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
					result += `${Literal.ImportSeparator} `;
				}

				if (parsedNode.multilineImport) {
					result += '\n';
				}
			});
			result += Literal.BracketClose;
		}

		result += ` ${Literal.From} ${config.QuoteSymbol}${parsedNode.path}${config.QuoteSymbol}`;

		if (config.UseSemicolon) {
			result += Literal.Semicolon;
		}

		result += '\n';

		return result;
	}

}
