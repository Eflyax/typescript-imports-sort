import * as vscode from 'vscode';

let
	sortOnSaveDisposer: vscode.Disposable;

export const activate = (context: vscode.ExtensionContext) => {
	const command = vscode.commands.registerCommand('extension.sortYmports', () => {
		const
			editor = vscode.window.activeTextEditor,
			document = editor.document,
			rawText = document.getText();

			console.log(rawText)
	});

	console.log({command});

	context.subscriptions.push(command);
};

export const deactivate =  () => {

};
