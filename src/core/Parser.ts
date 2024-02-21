import {ParsedGroup} from '../types';
import {ParsedNode} from './ParsedNode';
import {Sorter} from './Sorter';
import type {IConfiguration, INamedImport, IParsedNode} from '../types';

export class Parser {

	private destructingImportTokenRegex: RegExp;
	private importRegex: RegExp;
	private sorter: Sorter;
	private parsedRange = {
		from: 0,
		to: 0
	};
	private parsedNodes: Record<string, IParsedNode> = {};
	private configuration: IConfiguration = {};

	constructor(configuration: IConfiguration) {
		this.initRegex();
		this.configuration = configuration;
		this.sorter = new Sorter();
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


			// parsedNode.multilineImport = false; // TODO config.multilinePaths.includes(match[ParsedGroup.FilePath]);

			console.log(parsedNode.toString());

			const
				nodeKey = parsedNode.getKeyByImportPath();

			if (this.parsedNodes[nodeKey]) {
				this.parsedNodes[nodeKey].namedImports = [].concat(
					this.parsedNodes[nodeKey].namedImports,
					parsedNode.namedImports
				);
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
			importRegexString = `^import(\\s+type)?\\s+(${combinedImportTypes}\\s+from\\s+)?['"]([~@#:\\w\\\\/\.-]+)['"];?${inlineComment}\\r?\\n?`;

			this.importRegex = new RegExp(importRegexString, 'gm');
			this.destructingImportTokenRegex = new RegExp(destructingImportToken);
	}

	getOutputForSource(source: string): string {
		const
			nodes = this.parseImportNodes(source) as Array<IParsedNode>;

		if (!nodes.length) {
			return '';
		}

		let
			sortedNodes = '';

		for (const node of nodes) {
			sortedNodes += node.toString();
		}

		const
			contentBeforeImports = source.slice(0, this.parsedRange.from),
			contentAfterImports = source.slice(this.parsedRange.to, source.length);

		return contentBeforeImports + sortedNodes + contentAfterImports;
	}

}
