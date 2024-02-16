export interface IParsedNode {
	default: string | undefined,
	hasTypeKeyword: string | undefined,
	namedImports: [],
	namespace: string | undefined;
	path: string
	range: {
		index: number,
		lastIndex: number
	},
	multilineImport: boolean;
}

export interface INamedImport {
	alias: string | undefined;
	importName: string;
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

export enum Literal {
	All = '*',
	As = 'as',
	BracketClose = '}',
	BracketOpen = '{',
	From = 'from',
	Import = 'import',
	ImportSeparator = ',',
	Semicolon = ';',
	Type = 'type'
}
