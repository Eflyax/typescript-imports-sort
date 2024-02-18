import {config} from '../config';
import {ParsedGroup} from '../types';
import {ParsedNode} from './ParsedNode';
import {Sorter} from './Sorter';
import {Writer} from './Writer';
import fs from 'fs';
import type {INamedImport, IParsedNode} from '../types';

export class Parser {

	private destructingImportTokenRegex: RegExp;
	private importRegex: RegExp;
	private sorter: Sorter;
	private writer: Writer;
	private parsedRange = {
		from: 0,
		to: 0
	};
	private parsedNodes: Record<string, IParsedNode> = {};

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

		if (/(disable-sort-imports)/g.test(source)) {
			return [];
		}

		let
			match, minParsedRange = source.length, maxParsedRange = 0;

		while ((match =  this.importRegex.exec(source))) {
			const
				parsedNode = new ParsedNode();

			parsedNode.default = match[ParsedGroup.DefaultImport];
			parsedNode.hasTypeKeyword = !!match[ParsedGroup.TypeKeyword];
			parsedNode.namedImports = this.parseDestructiveImports(match[ParsedGroup.DestructingImportGroup]);
			parsedNode.namespace = match[ParsedGroup.NamespaceImport];
			parsedNode.path = match[ParsedGroup.FilePath];
			parsedNode.multilineImport = config.multilinePaths.includes(match[ParsedGroup.FilePath]);

			const
				nodeKey = parsedNode.getKeyByImportPath();

			if (this.parsedNodes[nodeKey]) {
				this.parsedNodes[nodeKey].namedImports = [].concat(this.parsedNodes[nodeKey].namedImports, parsedNode.namedImports);
			}
			else {
				this.parsedNodes[nodeKey] = parsedNode;
			}

			if (match.index < minParsedRange) {
				minParsedRange = match.index;
			}

			if (this.importRegex.lastIndex > maxParsedRange) {
				maxParsedRange = this.importRegex.lastIndex;
			}
		}

		this.parsedRange.from = minParsedRange;
		this.parsedRange.to = maxParsedRange;

		const
			imports = [];

		for (const key in this.parsedNodes) {
			imports.push(this.parsedNodes[key]);
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

		let
			sortedNodes = '';

		for (const node of nodes) {
			sortedNodes += this.writer.parsedNodeToString(node);
		}

		const
			contentBeforeImports = fileInput.slice(0, this.parsedRange.from),
			contentAfterImports = fileInput.slice(this.parsedRange.to, fileInput.length);

		return contentBeforeImports + sortedNodes + contentAfterImports;
	}

}
