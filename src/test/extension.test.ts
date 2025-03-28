import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Iniciando testes.');

	test('Extensão deve estar presente', () => {
		assert.ok(myExtension);
	});

	test('Extensão deve ativar', async () => {
		// O ID da extensão é publisher.name do package.json
		// Como estamos em desenvolvimento, o publisher é undefined
		// então usamos apenas o nome
		const ext = vscode.extensions.getExtension('pushcraft');
		assert.ok(ext, 'Extensão não encontrada');
		
		if (ext) {
			await ext.activate();
			assert.strictEqual(ext.isActive, true, 'Extensão não está ativa');
			
			// Verifica se o comando está registrado
			const commands = await vscode.commands.getCommands();
			assert.ok(commands.includes('fcmtest.showPanel'), 'Comando fcmtest.showPanel não encontrado');
			
			// Verifica se o container da view existe
			const views = vscode.window.createTreeView('fcmtest-container', {
				treeDataProvider: {
					getTreeItem: () => new vscode.TreeItem('Test'),
					getChildren: () => []
				}
			});
			assert.ok(views, 'Container da view não encontrado');
		}
	});
});
