const logger = require("../modules/logger.js");
const tracert = require("../modules/tracert.js");
const os = require("os");

module.exports = () => {
  return new Promise((resolve, reject) => {
    if (os.type() == "Windows_NT") {
      logger("info", "Running tracert to Local DNS Stream servers...");
      tracert("stream.vrcdn.live")
        .then((data) => {
          logger("info", "Tracert to Stream servers completed");
            logger("debug", `Stream Tracert data: ${JSON.stringify(data)}`);
            resolve(true);
        })
        .catch((err) => {
          logger("warn", `Failed to run tracert: ${err}`);
          reject(false);
        });
    } else {
      logger("warn", "Tracert is only supported on Windows");
      resolve(true);
    }
  });
};
