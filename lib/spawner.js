const fs = require('fs');
const { spawn } = require('child_process');

module.exports = function createSpawner(logPath  = 'handlers.log') {
    const out = fs.openSync(logPath, 'a');
    const err = fs.openSync(logPath, 'a');

    return cmd => {
        if (!cmd) return;

        const subprocess = spawn(cmd, [], {
            detached: true,
            shell: true,
            stdio: ['ignore', out, err]
        });

        subprocess.unref();

    }
}
