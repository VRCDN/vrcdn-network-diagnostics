// This test does have a limitation, it only checks IPv4. Currently this isn't an issue as we only have IPv4 servers, but it's something to keep in mind for the future.

/* dns.test.js
    Checks local DNS against a known decent source.
    Author: Aaron Francis
    Date: 2024-01-26
*/

const dns = require("dns");
const logger = require("../modules/logger.js");
const googleDNS = require("../modules/googleDNS.js");

Array.prototype.equalIgnoreOrder = function (array) {
    return JSON.stringify(this.sort()) === JSON.stringify(array.sort());
}

module.exports = () => {
    return new Promise((resolve, reject) => { 
        googleDNS("stream.vrcdn.live")
          .then((googleResults) => {
            logger("debug", `Getting local DNS results...`);
            logger(
              "debug",
              `Current DNS servers: ${dns.getServers()}`
            );
            dns.resolve4("stream.vrcdn.live", (error, localResults) => {
              if (error) {
                logger("error", `Stream DNS test failed: ${error}`);
                reject(error);
              }
              logger("debug", `Local DNS results: ${localResults}`);
              logger("debug", `Comparing local DNS results to Google...`);
              if (localResults.equalIgnoreOrder(googleResults)) {
                logger(
                  "success",
                  `Stream DNS test passed, local results match Google: ${localResults}`
                );
                resolve(true);
              } else {
                logger(
                  "warn",
                  `Stream DNS test failed, local results do not match Google: ${localResults}`
                );
                resolve("warn");
              }
            });
          })
          .catch((error) => {
            logger("error", `Stream DNS test failed: ${error}`);
            reject(false);
          });
    });
}
