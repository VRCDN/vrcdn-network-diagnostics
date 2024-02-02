const { exec } = require("child_process");
const os = require("os");
const logger = require("./logger.js");

const pingCommands = {
  Windows_NT: "ping -n $COUNT $HOST",
  Linux: "ping -c $COUNT $HOST",
  Darwin: "ping -c $COUNT $HOST",
};

const pingRegex = {
  Windows_NT:
    /Minimum = (\d+\.?\d*)ms, Maximum = (\d+\.?\d*)ms, Average = (\d+\.?\d*)ms/,
  Linux:
    /rtt min\/avg\/max\/mdev = (\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+) ms/,
  Darwin:
    /round-trip min\/avg\/max\/mdev = (\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+)\/(\d+\.\d+) ms/,
};

// Create a function to ping the stream
const ping = (host, count = 3) => {
    return new Promise((resolve, reject) => {
    logger("debug", `Pinging ${host}...`);
    exec(pingCommands[os.type()].replace("$COUNT", count).replace("$HOST", host), (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      if (stderr) {
        reject(stderr);
      }

      if (stdout) {
        // Parse the output
        const pingData = stdout.match(pingRegex[os.type()]);

          if (os.type() != "Windows_NT"){
            resolve({
              min: parseFloat(pingData[1]),
              max: parseFloat(pingData[3]),
              avg: parseFloat(pingData[2]),
              mdev: parseFloat(pingData[4]),
              dev: parseFloat(pingData[3])-parseFloat(pingData[1]) || 0,
            });
          } else {
            resolve({
              min: parseFloat(pingData[1]),
              max: parseFloat(pingData[2]),
              avg: parseFloat(pingData[3]),
              dev: parseFloat(pingData[2])-parseFloat(pingData[1]) || 0,
            });
          }
      }
    });
  });
};

module.exports = ping;