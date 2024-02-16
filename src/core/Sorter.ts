import {IParsedNode, ParsedNodeGroup} from '../types';

export class Sorter {

	sortNodes(nodes: Array<IParsedNode>): Array<IParsedNode> {
		const
			nodeGroups = {
				[ParsedNodeGroup.WithNamedImport]: [],
				[ParsedNodeGroup.WithDefaultImport]: [],
				[ParsedNodeGroup.WithoutNamedImport]: [],
				[ParsedNodeGroup.WithTypeKeyword]: [],
			}

		nodes.forEach((node: IParsedNode) => {
			if (node.hasTypeKeyword) {
				nodeGroups[ParsedNodeGroup.WithTypeKeyword].push(node);
			}
			else if (node.namedImports) {
				// todo - sort node.namedImports
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

		console.log(nodeGroups);


		// function compare( a, b ) {
		// 	if ( a.last_nom < b.last_nom ){
		// 		return -1;
		// 	}
		// 	if ( a.last_nom > b.last_nom ){
		// 		return 1;
		// 	}
		// 	return 0;
		// }
		// objs.sort( compare );

		return nodes;
	}

}
