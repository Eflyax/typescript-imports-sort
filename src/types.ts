/**
 * TODO
 */
export interface IParsedNode {
	default: string | undefined,
	hasTypeKeyword: string | undefined,
	namedImports: [],
	namespace: string
	path: string
	range: {
		index: number,
		lastIndex: number
	}
}

export enum ParsedGroup {
	Alias = 5,
	DefaultImport = 6 || 19,
	DestructingImportGroup = 7 || 20,
	FilePath = 32,
	ImportName = 2,
	InlineComment = 33,
	NamespaceImport = 4,
	TypeKeyword = 1
}
