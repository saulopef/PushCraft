"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Extensão FCM Test está ativa!');
    // Criar e mostrar o painel lateral
    const panel = vscode.window.createWebviewPanel('fcmtest.notificationPanel', 'FCM Test', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    // Carregar o conteúdo HTML do painel
    panel.webview.html = getWebviewContent(context.extensionPath);
    // Manipular mensagens do webview
    panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
            case 'sendNotification':
                try {
                    // Inicializar Firebase Admin
                    admin.initializeApp({
                        credential: admin.credential.cert(message.data.serviceAccount)
                    });
                    // Enviar notificação
                    const payload = {
                        notification: {
                            title: message.data.title,
                            body: message.data.message
                        },
                        token: message.data.deviceToken
                    };
                    const response = await admin.messaging().send(payload);
                    panel.webview.postMessage({
                        command: 'success',
                        text: `Notificação enviada com sucesso! Message ID: ${response}`
                    });
                }
                catch (error) {
                    panel.webview.postMessage({
                        command: 'error',
                        text: `Erro ao enviar notificação: ${error}`
                    });
                }
                break;
        }
    }, undefined, context.subscriptions);
    // Registrar o comando para mostrar o painel
    let disposable = vscode.commands.registerCommand('fcmtest.showPanel', () => {
        panel.reveal(vscode.ViewColumn.One);
    });
    context.subscriptions.push(disposable);
}
function getWebviewContent(extensionPath) {
    const htmlPath = path.join(extensionPath, 'src', 'panel.html');
    return require('fs').readFileSync(htmlPath, 'utf8');
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map