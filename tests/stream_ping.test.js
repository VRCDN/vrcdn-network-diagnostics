const ping = require("../modules/ping.js");
const logger = require("../modules/logger.js");
module.exports = () => {
    return new Promise((resolve, reject) => {
        
        ping("stream.vrcdn.live", 10).then(pingData => {
            logger(
              "debug",
              `Stream Ping test data: ${JSON.stringify(pingData)}`
            );
            if (pingData.dev > 16) {
                logger(
                  "fail",
                  `Stream Ping deviation test failed: ${pingData.dev}ms`
                );
                resolve(false);
            } else {
                logger(
                  "success",
                  `Stream Ping deviation test passed: ${pingData.dev}ms`
                );
                resolve(true);
            }
        }).catch(error => {
            logger("error", `Stream Ping test failed: ${error}`);
            reject(false);
        });
    });
}