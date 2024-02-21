export interface IParsedNode {
	default: string | undefined;
	hasTypeKeyword: boolean;
	multilineImport: boolean;
	namedImports: Array<INamedImport>;
	namespace: string | undefined;
	path: string;
	getKeyByImportPath(): string;
	getOutputPath(): string;
	toString(): string;
}

export interface INamedImport {
	alias: string | undefined;
	importName: string;
}

export interface IConfiguration {
	IndentationSymbol: string;
	MaximumLineLength: number;
	QuoteSymbol: string;
	SpaceAroundBrackets: boolean;
	UseSemicolon: boolean;
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

export enum ParsedNodeGroup {
	Other = 'other',
	WithDefaultImport = 'withDefaultImport',
	WithNamedImport = 'withNamedImport',
	WithoutNamedImport = 'withoutNamedImport',
	WithTypeKeyword = 'withTypeKeyword'
}
