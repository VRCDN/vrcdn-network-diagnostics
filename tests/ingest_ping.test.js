const ping = require("../modules/ping.js");
const logger = require("../modules/logger.js");
module.exports = () => {
    return new Promise((resolve, reject) => {
        
        ping("ingest.vrcdn.live", 10).then(pingData => {
            logger(
              "debug",
              `Ingest Ping test data: ${JSON.stringify(pingData)}`
            );
            if (pingData.dev > 16) {
                logger("fail", `Ingest Ping deviation test failed: ${pingData.dev}ms`);
                resolve(false);
            } else {
                logger(
                  "success",
                  `Ingest Ping deviation test passed: ${pingData.dev}ms`
                );
                resolve(true);
            }
        }).catch(error => {
            logger("error", `Ingest Ping test failed: ${error}`);
            reject(error);
        });
    });
}