const fs = require("fs");
const key = fs.readFileSync("server.key");
const cert = fs.readFileSync("server.cert");

module.exports = {
  secretKey: "48662-52927-46726-76283",
  mongoUrl: "mongodb://localhost:27017/GLIAgencyDataBase",
  key: key,
  cert: cert,
};
