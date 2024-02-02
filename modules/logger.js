const fs = require("fs");

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

if (fs.existsSync("./logs/latest.log")) {
  let i = 1;
  while (fs.existsSync(`./logs/old${i}.log`)) {
    i++;
  }
  fs.renameSync("./logs/latest.log", `./logs/old${i}.log`);
}

const log = (type, message) => {
  type = type.toUpperCase();


  fs.appendFileSync("./logs/latest.log", `[${type}] ${message}\n`);

  if (type === "DEBUG" && !process.env.DEBUG) return;
  const colours = {
    ERROR: "\x1b[31m",
    WARN: "\x1b[33m",
    DEBUG: "\x1b[35m",
    INFO: "\x1b[36m",
    SUCCESS: "\x1b[32m",
    FAIL: "\x1b[31m",
    reset: "\x1b[0m",
  };

  console.log(`${colours[type]}[${type}] ${message}${colours.reset}`);
};

module.exports = log;
