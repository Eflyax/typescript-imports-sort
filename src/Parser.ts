import {ParsedGroup} from './types';
import type {INamedImport, IParsedNode} from './types';

export class Parser {

	private destructingImportTokenRegex: RegExp;
	private importRegex: RegExp;

	constructor() {
		this.initRegex();
	}

	parseDestructiveImports = (destructiveImports: string): Array<INamedImport> => {
		if (!destructiveImports) {
			return null;
		}

		return (destructiveImports)
			.split(',')
			.map((destructiveImport) => {
				const match =
					this.destructingImportTokenRegex.exec(destructiveImport);

				return !match
					? null
					: {
						alias: match[ParsedGroup.NamespaceImport],
						importName: match[ParsedGroup.TypeKeyword]
					};
			})
			.filter((destructiveImport) => !!destructiveImport?.importName);
	};

	parseImportNodes = (source: string): Array<IParsedNode> => {
		this.importRegex.lastIndex = 0;

		const
			imports = [];

		if (/(disable-sort-imports)/g.test(source)) {
			return [];
		}

		let match;

		while ((match =  this.importRegex.exec(source))) {
			imports.push({
				default: match[ParsedGroup.DefaultImport],
				hasTypeKeyword: match[ParsedGroup.TypeKeyword],
				namedImports: this.parseDestructiveImports(match[ParsedGroup.DestructingImportGroup]),
				namespace: match[ParsedGroup.NamespaceImport],
				path: match[ParsedGroup.FilePath],
				range: {
					index: match.index,
					lastIndex: this.importRegex.lastIndex
				}
			});
		}

		return imports;
	};

	initRegex(): void {
		const
			name = `((?!\\d)(?:(?!\\s)[$\\w\\u0080-\\uFFFF]|\\\\u[\\da-fA-F]{4}|\\\\u\\{[\\da-fA-F]+\\})+)`,
			ws = `\\s`,
			spaceNoReturns = `[^\\S\\r\\n]`,
			namespaceToken = `\\*\\s+as\\s+(${name})`,
			defaultImportToken = name,
			destructingImportToken = `(${name})(\\s+as\\s+(${name}))?`,
			destructingImport = `{(${ws}*${destructingImportToken}(${ws}*,${ws}*${destructingImportToken})*${ws}*,?${ws}*)}`,
			defaultAndDestructingImport = `${defaultImportToken}${ws}*,${ws}*${destructingImport}`,
			combinedImportTypes = `(${namespaceToken}|${defaultImportToken}|${destructingImport}|${defaultAndDestructingImport})`,
			inlineComment = `(${spaceNoReturns}*[\\/]{2}.*)?`,
			importRegexString = `^import(\\s+type)?\\s+(${combinedImportTypes}\\s+from\\s+)?['"]([~@\\w\\\\/\.-]+)['"];?${inlineComment}\\r?\\n?`;

			this.importRegex = new RegExp(importRegexString, 'gm');
			this.destructingImportTokenRegex = new RegExp(destructingImportToken);
	}

}
