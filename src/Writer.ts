import {Literal} from './types';
import {config} from './config';
import type {IParsedNode} from './types';

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
			// result +=
		}

		result += ` ${Literal.From} ${config.QuoteSymbol}${parsedNode.path}${config.QuoteSymbol}`;

		if (config.UseSemicolon) {
			result += Literal.Semicolon;
		}

		return result;
	}

}
