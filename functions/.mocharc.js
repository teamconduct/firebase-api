'use strict';

module.exports = {
    diff: true,
    reporter: 'spec',
    extension: ['ts'],
    spec: [
        'test/**/*.test.ts'
    ],
    slow: 75,
    timeout: 30000,
    ui: 'bdd',
    'watch-files': [
        'test/**/*.test.ts'
    ],
    require: [
        'ts-node/register',
        'ts-node/esm'
    ],
    'register-option': {
        maxDiffSize: 0
    }
}
