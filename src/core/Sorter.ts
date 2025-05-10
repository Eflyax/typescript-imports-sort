import {INamedImport, IParsedNode, ParsedNodeGroup} from '../types';

export class Sorter {

	sortNodes(nodes: Array<IParsedNode>): Array<IParsedNode> {
		const
			nodeGroups = {
				[ParsedNodeGroup.WithNamedImport]: [],
				[ParsedNodeGroup.WithDefaultImport]: [],
				[ParsedNodeGroup.WithoutNamedImport]: [],
				[ParsedNodeGroup.WithTypeKeyword]: [],
				[ParsedNodeGroup.Other]: []
			}

		nodes.forEach((node: IParsedNode) => {
			if (node.namedImports) {
				node.namedImports.sort(this.compareNamedImports);
			}

			if (node.hasTypeKeyword) {
				nodeGroups[ParsedNodeGroup.WithTypeKeyword].push(node);
				nodeGroups[ParsedNodeGroup.WithTypeKeyword].sort(this.compareNodesWithTypeKeyword);
			}
			else if (node.namedImports) {
				nodeGroups[ParsedNodeGroup.WithNamedImport].push(node);
				nodeGroups[ParsedNodeGroup.WithNamedImport].sort(this.compareNodesWithNamedImports);
			}
			else if (node.default) {
				nodeGroups[ParsedNodeGroup.WithDefaultImport].push(node);
				nodeGroups[ParsedNodeGroup.WithDefaultImport].sort(this.compareNodesWithDefaultImport);
			}
			else if (!node.namespace) {
				nodeGroups[ParsedNodeGroup.Other].push(node);
			}
			else {
				nodeGroups[ParsedNodeGroup.WithoutNamedImport].push(node);
				nodeGroups[ParsedNodeGroup.WithoutNamedImport].sort(this.compareNodesWithoutNamedImport)
			}
		});

		let
			result = [];

		for (const key in nodeGroups) {
			nodeGroups[key].forEach((parsedNode: IParsedNode) => {
				result.push(parsedNode);
			});
		}

		return result;
	}

	compareNodesWithNamedImports(objectA: IParsedNode, objectB: IParsedNode): number {
		function chainNamedImports(namedImports: Array<INamedImport>): string {
			let result = '';

			namedImports.forEach((namedImport: INamedImport) => result += namedImport.importName);

			return result;
		}

		const
			importNameA = chainNamedImports(objectA.namedImports).toUpperCase(),
			importNameB = chainNamedImports(objectB.namedImports).toUpperCase();

		return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
	}

	compareNodesWithoutNamedImport(objectA: IParsedNode, objectB: IParsedNode): number {
		const
			importNameA = objectA.namespace.toUpperCase(),
			importNameB = objectB.namespace.toUpperCase();

		return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
	}

	compareNodesWithDefaultImport(objectA: IParsedNode, objectB: IParsedNode): number {
		const
			importNameA = objectA.default.toUpperCase(),
			importNameB = objectB.default.toUpperCase();

		return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
	}

	compareNodesWithTypeKeyword(objectA: IParsedNode, objectB: IParsedNode): number {
		if (objectA.default && !objectB.default) {
			return 1;
		}
		else if(!objectA.default && objectB.default) {
			return -1;
		}

		const
			namedImportsA = objectA.namedImports ? objectA.namedImports[0]?.importName.toUpperCase() : '',
			namedImportsB = objectB.namedImports ? objectB.namedImports[0]?.importName.toUpperCase() : '';

		return (namedImportsA < namedImportsB) ? -1 : (namedImportsA > namedImportsB) ? 1 : 0;
	}

	compareNamedImports(objectA: INamedImport, objectB: INamedImport): number {
		const
			importNameA = objectA.importName.toUpperCase(),
			importNameB = objectB.importName.toUpperCase();

		return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
	}

}
