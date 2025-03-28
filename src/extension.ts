// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as admin from 'firebase-admin';
import * as path from 'path';

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

	// Criar o provider da webview
	const provider = new FcmTestViewProvider(context.extensionPath);

	// Registrar o provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('fcmtest.notificationPanel', provider)
	);
}

class FcmTestViewProvider implements vscode.WebviewViewProvider {
	private _view?: vscode.WebviewView;

	constructor(private readonly _extensionPath: string) {}

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	): void | Thenable<void> {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionPath, 'src'))
			]
		};

		webviewView.webview.html = this._getHtmlContent();

		// Manipular mensagens do webview
		webviewView.webview.onDidReceiveMessage(async message => {
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
						webviewView.webview.postMessage({
							command: 'success',
							text: `Notificação enviada com sucesso! Message ID: ${response}`
						});
					} catch (error) {
						webviewView.webview.postMessage({
							command: 'error',
							text: `Erro ao enviar notificação: ${error}`
						});
					}
					break;
			}
		});
	}

	private _getHtmlContent(): string {
		const htmlPath = path.join(this._extensionPath, 'src', 'panel.html');
		return require('fs').readFileSync(htmlPath, 'utf8');
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
