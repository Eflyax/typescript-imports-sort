import {IParsedNode} from './types';

export class NodeWriter {

	constructor() {

	}

	nodeToString(node: IParsedNode): string {
		return JSON.stringify(node);
	}

}
