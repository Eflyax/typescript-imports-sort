import {config} from '../config';
import {ParsedGroup} from '../types';
import {Sorter} from './Sorter';
import {Writer} from './Writer';
import fs from 'fs';
import type {INamedImport, IParsedNode} from '../types';

export class Parser {

	private destructingImportTokenRegex: RegExp;
	private importRegex: RegExp;
	private sorter: Sorter;
	private writer: Writer;

	constructor() {
		this.initRegex();
		this.sorter = new Sorter();
		this.writer = new Writer();
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
				},
				multilineImport: config.multilinePaths.includes(match[ParsedGroup.FilePath])
			});
		}

		return this.sorter.sortNodes(imports);
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

	getOutputForSourceFile(filePath: string): string {
		const
			fileInput = fs.readFileSync(filePath, 'utf-8'),
			nodes = this.parseImportNodes(fileInput);

		let result = '';

		for (const node of nodes) {
			result += this.writer.parsedNodeToString(node);
		}

		return result;
	}

}
