const logger = require("./logger.js");

let serverCache;
module.exports = () => {
    return new Promise((resolve, reject) => {
        logger("debug", "Getting VRCDN servers...");
        // Requests to this function happen too fast to cache the results. The requests between tests happens before the first request can finish. We will cache anyway.
        if(serverCache !== undefined) {
            logger("debug", `Got cached VRCDN servers: ${JSON.stringify(serverCache)}`);
            resolve(serverCache.servers);
        }
        fetch(
          "https://deployment.eu-central-1.linodeobjects.com/probes/extras/servers.json"
        ).then(res => res.json()).then((servers) => {
            logger("debug", `Got VRCDN servers: ${JSON.stringify(servers)}`);
            serverCache = servers;
            resolve(servers.servers);
        }).catch((error) => {
            logger("error", `Failed to get VRCDN servers: ${error}`);
            reject(error);
        });
    });
}