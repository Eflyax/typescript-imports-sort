import {parse} from 'url';
import {INamedImport, IParsedNode, ParsedNodeGroup} from '../types';

export class Sorter {

	sortNodes(nodes: Array<IParsedNode>): Array<IParsedNode> {
		const
			nodeGroups = {
				[ParsedNodeGroup.WithNamedImport]: [],
				[ParsedNodeGroup.WithDefaultImport]: [],
				[ParsedNodeGroup.WithoutNamedImport]: [],
				[ParsedNodeGroup.WithTypeKeyword]: []
			}

		nodes.forEach((node: IParsedNode) => {
			if (node.namedImports) {
				node.namedImports.sort(this.compareNamedImports);
			}

			if (node.hasTypeKeyword) {
				nodeGroups[ParsedNodeGroup.WithTypeKeyword].push(node);
			}
			else if (node.namedImports) {
				nodeGroups[ParsedNodeGroup.WithNamedImport].push(node);
			}
			else if (node.default) {
				nodeGroups[ParsedNodeGroup.WithDefaultImport].push(node);
			}
			else {
				// todo - sort node.namedImports (alias / importName ?)
				nodeGroups[ParsedNodeGroup.WithoutNamedImport].push(node);
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

	compareNamedImports(objectA: INamedImport, objectB: INamedImport): number {
		const
			importNameA = objectA.importName.toUpperCase(),
			importNameB = objectB.importName.toUpperCase();

		return (importNameA < importNameB) ? -1 : (importNameA > importNameB) ? 1 : 0;
	}

}
