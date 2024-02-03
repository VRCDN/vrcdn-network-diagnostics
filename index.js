#!/usr/bin/env -S node --no-warnings=ExperimentalWarning
// The shebang above is used to silence warnings when compiling native experimental Node SEA. Read more: https://nodejs.org/api/single-executable-applications.html

const fs = require("fs");
const path = require("path");
const logger = require("./modules/logger.js");
const os = require("os");
const readline = require("readline");
const tracert = require("./modules/tracert.js");

const version = "v1.0.0";

fetch("http://report.api.vrcdn.live")
  .then((res) => res.json())
  .then((data) => {
    logger("info", `VRCDN Diagnostic API is online, version: ${data.ver}`);
    if (data.ver != version) {
      logger(
        "warn",
        `This diagnostic tool is out of date, please update to the latest version. This may impact your ability to submit logs.`
      );
    }

    let autoSubmit = false;
    process.argv.forEach((arg, index) => {
      if (arg == "--auto-submit" || arg == "-a") {
        autoSubmit = true;
      }
      if (arg == "--help" || arg == "-h") {
        console.log(
          "Options:\n  -a, --auto-submit  Automatically submit the log to VRCDN (Policies apply)\n  -h, --help         Show this help message"
        );
        process.exit(0);
      }
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    logger(
      "debug",
      `Detected OS type ${os.type()}, platform ${os.platform()}, and architecture ${
        os.arch
      } ${os.release}`
    );

    logger("debug", `Current UTC time: ${new Date().toUTCString()}`);

    const files = fs.readdirSync("./tests");

    const testFiles = files.filter((file) => {
      return file.includes(".test.js");
    });

    let testRunners = [];

    testFiles.forEach((file) => {
      logger("info", `Running test: ${file.replace(".test.js", "")}`);
      testRunners.push(require(`./tests/${file}`)());
    });

    // We are doing this because SEA doesn't support dynamic imports, this is created only when building for SEA. This is also done dynamically by the build script not included in the repo.
    // const testFiles = ["find_best_ingest.test.js", "find_best_stream.test.js", "ingest_dns.test.js", "ingest_ping.test.js", "stream_dns.test.js", "stream_ping.test.js", "tracert_ingest.test.js", "tracert_stream.test.js"]
    // logger("info", "Running test: find_best_ingest")
    // testRunners.push(require('./tests/find_best_ingest.test.js')())
    // logger("info", "Running test: find_best_stream")
    // testRunners.push(require('./tests/find_best_stream.test.js')())
    // logger("info", "Running test: ingest_dns")
    // testRunners.push(require('./tests/ingest_dns.test.js')())
    // logger("info", "Running test: ingest_ping")
    // testRunners.push(require('./tests/ingest_ping.test.js')())
    // logger("info", "Running test: stream_dns")
    // testRunners.push(require('./tests/stream_dns.test.js')())
    // logger("info", "Running test: stream_ping")
    // testRunners.push(require('./tests/stream_ping.test.js')())
    // logger("info", "Running test: tracert_ingest")
    // testRunners.push(require('./tests/tracert_ingest.test.js')())
    // logger("info", "Running test: tracert_stream")
    // testRunners.push(require('./tests/tracert_stream.test.js')())

    function submitLog() {
      logger("info", "Submitting log to VRCDN...");
      fetch("http://report.api.vrcdn.live/v1/submit", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: fs
          .readFileSync(path.join(__dirname, "logs", "latest.log"))
          .toString(),
      })
        .then((res) => {
          if (res.status == 200) {
            logger("success", "Log submitted successfully");
          } else {
            logger(
              "fail",
              `Failed to submit log: ${res.status} ${res.statusText}`
            );
          }

          process.exit(0);
        })
        .catch((err) => {
          logger("fail", `Failed to submit log: ${err}`);
          process.exit(0);
        });
    }

    Promise.all(testRunners).then((results) => {
      logger("info", "---- Start of test results ----");
      results.forEach((result, index) => {
        if (!result) {
          logger(
            "fail",
            `Test ${testFiles[index].replace(".test.js", "")} failed`
          );
        } else if (result === "warn") {
          logger(
            "warn",
            `Test ${testFiles[index].replace(".test.js", "")} warned`
          );
        } else {
          logger(
            "success",
            `Test ${testFiles[index].replace(".test.js", "")} passed`
          );
        }
      });
      if (results.includes(false)) {
        logger("fail", "Some Tests Failed");
      } else {
        logger("success", "All Tests passed");
      }
      logger("info", `---- End of test results ----`);
      logger(
        "warn",
        `Log file located at ${path.join(
          __dirname,
          "logs",
          "latest.log"
        )}, this log file contains all test results, debug info and OS info.`
      );
      logger(
        "info",
        "Files submitted to VRCDN will be kept and possibly processed under the policies outlined on https://vrcdn.live/policies"
      );
      if (autoSubmit) {
        submitLog();
      } else {
        rl.question(
          "Would you like to submit the latest log to VRCDN? (Y/n) ",
          (answer) => {
            rl.close();
            if (
              answer == "" ||
              answer.toLowerCase() == "y" ||
              answer.toLowerCase() == "yes"
            ) {
              submitLog();
            }
          }
        );
      }
    });
  })
  .catch((error) => {
    logger("warn", `Failed to connect to VRCDN Diagnostic API: ${error}`);
  });
