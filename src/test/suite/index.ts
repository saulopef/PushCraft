import * as path from 'path';
import * as fs from 'fs';
import Mocha from 'mocha';

export function run(): Promise<void> {
    // Cria o objeto de teste do Mocha
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise<void>((resolve, reject) => {
        // Função recursiva para encontrar arquivos de teste
        function findTestFiles(dir: string): string[] {
            const files = fs.readdirSync(dir);
            let testFiles: string[] = [];

            for (const file of files) {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    testFiles = testFiles.concat(findTestFiles(fullPath));
                } else if (file.endsWith('.test.js')) {
                    testFiles.push(fullPath);
                }
            }

            return testFiles;
        }

        try {
            const files = findTestFiles(testsRoot);

            // Adiciona arquivos ao teste do mocha
            files.forEach((f: string) => mocha.addFile(f));

            // Executa os testes
            mocha.run((failures: number) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err: unknown) {
            console.error(err);
            reject(err);
        }
    });
} 