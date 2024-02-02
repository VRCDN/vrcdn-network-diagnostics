const getVRCDNServers = require('../modules/getVRCDNServers.js')
const ping = require('../modules/ping.js')
const logger = require('../modules/logger.js')

module.exports = () => {
    return new Promise((resolve, reject) => {
        getVRCDNServers().then(servers => {
            let pingTests = [];
            servers = servers.filter(server => {
                return server.MediaServerId.includes('edge');
            })
            servers.forEach(server => {
                pingTests.push(ping(server.Ip))
            })
            Promise.all(pingTests).then(results => {
                let bestServer = { ping: { avg: 9999 } };
                results.forEach((result, index) => {
                    logger(
                        "debug",
                        `Server ${servers[index].Ip} (${
                        servers[index].MediaServerId
                        }): ${JSON.stringify(result)}`
                    );
                    if (
                      result.avg < bestServer.ping.avg
                    ) {
                      logger(
                        "debug",
                        `Found a better Stream server: ${servers[index].Ip} (${servers[index].MediaServerId}) with an average ping of ${result.avg}ms`
                      );
                      bestServer = {
                        server: servers[index],
                        ping: result,
                      };
                    }
                })
                logger('info', `Best Stream server: ${bestServer.server.Ip} (${bestServer.server.MediaServerId}) with an average ping of ${bestServer.ping.avg}ms`)
                resolve(bestServer)
            }).catch(err => {
                reject(err)
            })
            }).catch(err => {
            reject(err)
        })
    })
}