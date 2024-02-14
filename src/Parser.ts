import {ParsedGroup} from './types';
import type {IParsedNode} from './types';

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
	importRegexString = `^import(\\s+type)?\\s+(${combinedImportTypes}\\s+from\\s+)?['"]([~@\\w\\\\/\.-]+)['"];?${inlineComment}\\r?\\n?`,
	importRegex = new RegExp(importRegexString, 'gm'),
	destructingImportTokenRegex = new RegExp(destructingImportToken);

const parseDestructiveImports = (destructiveImports) => {
	// if (!destructiveImports) {
	// 	return null;
	// }

	return (destructiveImports.toString())
		.split(',')
		.map((destructiveImport) => {
			const match = destructingImportTokenRegex.exec(destructiveImport);
			return !match ? null : { alias: match[4], importName: match[1] };
		})
		.filter((destructiveImport) => !!destructiveImport?.importName);
};

export const parseImportNodes = (source: string): Array<IParsedNode> => {
	importRegex.lastIndex = 0;

	const
		imports = [];

	if (/(disable-sort-imports)/g.test(source)) {
		return [];
	}

	let match;

	while ((match = importRegex.exec(source))) {
		imports.push({
			default: match[ParsedGroup.DefaultImport],
			hasTypeKeyword: match[ParsedGroup.TypeKeyword],
			namedImports:  parseDestructiveImports(7 || 20),// parseDestructiveImports(ParsedGroup.DestructingImportGroup),
			namespace: match[ParsedGroup.NamespaceImport],
			path: match[ParsedGroup.FilePath],
			range: {
				index: match.index,
				lastIndex: importRegex.lastIndex
			}
		});
	}

	return imports;
};
