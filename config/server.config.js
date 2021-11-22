const http = require("http");
const {app} = require('./express.config')


const PORT = process.env.PORT || 4007;
const server = http.createServer(app);


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

exports.server = server;