import * as path from 'path';
import * as process from 'process';

import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // O diretório raiz da extensão
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // O diretório de teste
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Baixa o VS Code, descompacta ele e executa os testes
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath,
        });
    } catch (err) {
        console.error('Falha ao executar os testes');
        process.exit(1);
    }
}

main(); 