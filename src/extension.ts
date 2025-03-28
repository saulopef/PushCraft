// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Função para gerar um nome único para o app baseado nas credenciais
function getAppName(serviceAccount: any): string {
	return `fcm-app-${serviceAccount.project_id}-${serviceAccount.client_email}`;
}

// Função para criar o payload específico de cada plataforma
function createPlatformPayload(data: any): admin.messaging.Message {
	const basePayload: admin.messaging.Message = {
		notification: {
			title: data.title,
			body: data.message,
			imageUrl: data.imageUrl || undefined
		},
		token: data.deviceToken
	};

	switch (data.platform) {
		case 'web':
			return {
				...basePayload,
				webpush: {
					notification: {
						icon: 'https://www.google.com/images/branding/product/ico/android_48dp.ico',
						badge: 'https://www.google.com/images/branding/product/ico/android_48dp.ico',
						actions: data.redirectUrl ? [
							{
								action: 'open',
								title: 'Abrir'
							}
						] : undefined
					},
					fcmOptions: {
						link: data.redirectUrl
					}
				}
			};

		case 'android':
			return {
				...basePayload,
				android: {
					notification: {
						channelId: data.channelId || 'default',
						priority: data.priority === 'high' ? 'max' : 'default',
						clickAction: data.clickAction || 'OPEN_ACTIVITY',
						...(data.imageUrl ? { imageUrl: data.imageUrl } : {})
					},
					data: data.redirectUrl ? {
						redirectUrl: data.redirectUrl
					} : undefined
				}
			};

		case 'ios':
			return {
				...basePayload,
				apns: {
					payload: {
						aps: {
							sound: data.sound === 'custom' ? 'default' : data.sound,
							badge: data.badge || 1,
							'mutable-content': 1
						},
						redirectUrl: data.redirectUrl
					},
					fcmOptions: {
						imageUrl: data.imageUrl
					}
				}
			};

		default:
			return basePayload;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extensão FCM Test está ativa!');

	// Criar e mostrar o painel lateral
	const panel = vscode.window.createWebviewPanel(
		'fcmtest.notificationPanel',
		'FCM Test',
		{ viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
		{
			enableScripts: true,
			retainContextWhenHidden: true
		}
	);

	// Mover o painel para a área inferior
	vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');

	// Carregar o conteúdo HTML do painel
	panel.webview.html = getWebviewContent(context.extensionPath);

	// Manipular mensagens do webview
	panel.webview.onDidReceiveMessage(
		async message => {
			switch (message.command) {
				case 'sendNotification':
					try {
						const appName = getAppName(message.data.serviceAccount);
						
						// Verificar se já existe um app com essas credenciais
						let app: admin.app.App;
						try {
							app = admin.app(appName);
						} catch {
							// Se não existir, criar um novo app
							app = admin.initializeApp({
								credential: admin.credential.cert(message.data.serviceAccount)
							}, appName);
						}

						// Criar payload específico da plataforma
						const payload = createPlatformPayload(message.data);

						// Enviar notificação usando o app específico
						const response = await admin.messaging(app).send(payload);
						panel.webview.postMessage({
							command: 'success',
							text: `Notificação enviada com sucesso! Message ID: ${response}`
						});
					} catch (error) {
						panel.webview.postMessage({
							command: 'error',
							text: `Erro ao enviar notificação: ${error}`
						});
					}
					break;
			}
		},
		undefined,
		context.subscriptions
	);

	// Registrar o comando para mostrar o painel
	const disposable = vscode.commands.registerCommand('fcmtest.showPanel', () => {
		panel.reveal(vscode.ViewColumn.Two);
		vscode.commands.executeCommand('workbench.action.moveEditorToBelowGroup');
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(extensionPath: string): string {
	const htmlPath = path.join(extensionPath, 'src', 'panel.html');
	return fs.readFileSync(htmlPath, 'utf8');
}

// This method is called when your extension is deactivated
export function deactivate() {}
