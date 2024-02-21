import {IConfiguration} from './types';
import {Parser} from './core/Parser';
import * as vscode from 'vscode';

function hashCode(s: string): number {
	for (var h = 0, i = 0; i < s.length; h &= h) {
		h = 31 * h + s.charCodeAt(i++);
	}

	return h;
}

export const activate = (context: vscode.ExtensionContext) => {
	const command = vscode.commands.registerCommand('extension.sortImports', () => {

		console.log({'getConfiguration()': getConfiguration()});

		const
			parser = new Parser(getConfiguration()),
			editor = vscode.window.activeTextEditor,
			document = editor.document,
			rawText = document.getText(),
			result = parser.getOutputForSource(rawText);

		if (!result || hashCode(rawText) === hashCode(result)) {
			return;
		}

		vscode.window.activeTextEditor.edit(builder => {
			builder.replace(
				new vscode.Range(
					document.lineAt(0).range.start,
					document.lineAt(document.lineCount - 1).range.end
				),
				result
			);
		});
	});

	context.subscriptions.push(command);
};

export const deactivate =  () => {

};

function getConfiguration(): IConfiguration {
	const
		extensionConfiguration = vscode.workspace.getConfiguration('typescript.extension.sortImports');

	return {
		TabsIndentation: extensionConfiguration.tabsIndentation,
		MaximumLineLength: extensionConfiguration.maxCharactersInSingleLine,
		QuoteSymbol: extensionConfiguration.quoteStyle === 'single' ? `'`: `"`,
		SpaceAroundBrackets: extensionConfiguration.spaceAroundBrackets,
		UseSemicolon: extensionConfiguration.omitSemicolon
	} as IConfiguration;
}
