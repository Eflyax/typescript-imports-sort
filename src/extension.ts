import {Parser} from './core/Parser';
import * as vscode from 'vscode';

export const activate = (context: vscode.ExtensionContext) => {
	const command = vscode.commands.registerCommand('extension.sortYmports', () => {
		const
			parser = new Parser(),
			editor = vscode.window.activeTextEditor,
			document = editor.document,
			rawText = document.getText(),
			result = parser.getOutputForSource(rawText);

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
