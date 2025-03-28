import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export function run(): Promise<void> {
    // Cria o objeto de teste do Mocha
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise<void>((resolve, reject) => {
        glob('**/**.test.js', { cwd: testsRoot })
            .then((files: string[]) => {
                // Adiciona arquivos ao teste do mocha
                files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)));

                try {
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
            })
            .catch((err: unknown) => {
                console.error(err);
                reject(err);
            });
    });
} 