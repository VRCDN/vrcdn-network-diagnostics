#!/usr/bin/env -S node --no-warnings=ExperimentalWarning

// read the tests directory and run all .test.js files
const fs = require("fs");
const path = require("path");
const logger = require("./modules/logger.js");
const os = require("os");
const readline = require("readline");

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

    // read command line arguments and set an auto-submit flag
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

    // read the tests directory
    const files = fs.readdirSync("./tests");

    // filter out any non-test files
    const testFiles = files.filter((file) => {
      return file.includes(".test.js");
    });

    let testRunners = [];

    // run each test file
    testFiles.forEach((file) => {
      logger("info", `Running test: ${file.replace(".test.js", "")}`);
      testRunners.push(require(`./tests/${file}`)());
    });

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

    // wait for all tests to finish
    Promise.all(testRunners).then((results) => {
      logger("info", "---- Start of test results ----");
      // check if any tests failed
      results.forEach((result, index) => {
        if (!result) {
          logger(
            "fail",
            `Test ${testFiles[index].replace(".test.js", "")} failed`
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
