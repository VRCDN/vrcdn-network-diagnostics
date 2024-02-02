const logger = require("./logger.js");
function getGoogleResults(host) {
  return new Promise((resolve, reject) => {
    logger("debug", `Getting Google DNS results...`);
    fetch(`https://dns.google/resolve?name=${host}&type=A`)
      .then((response) => response.json())
      .then((data) => {
        let results = [];
        data.Answer.forEach((element) => {
          results.push(element.data);
        });
        logger("debug", `Google DNS results: ${results}`);
        resolve(results);
      })
      .catch((error) => {
        reject(error);
      });
  });
}


module.exports = getGoogleResults;