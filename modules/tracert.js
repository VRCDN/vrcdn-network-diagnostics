// this modules only runs on windows
const logger = require('./logger.js');

module.exports = (host) => {
    return new Promise((resolve, reject) => {
        const { exec } = require('child_process');
        exec(`tracert -w 150 -d ${host}`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                let tracertRegex =
                  /^\s*(\d+)\s+(<?[\d*]*)(\s*ms)?\s+(<?[\d*]*)(\s*ms)?\s*(<?[\d*]*)(\s*ms)?\s*(.+)|(Request timed out[.])$/gm;
                let tracertData = [];
                let match;
                while ((match = tracertRegex.exec(stdout)) !== null) {
                    tracertData.push({
                        hop: match[1],
                        ip: match[8] || null,
                        time1: match[2] || null,
                        time2: match[4] || null,
                        time3: match[6] || null,
                    });
                }
                resolve(tracertData);
            }
        });
    });
}