// wrapper allowing the usage of ES Modules in node.js
require = require("esm")(module /*, options*/);
module.exports = require("./server.js");