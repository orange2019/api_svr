var TestRPC = require("ethereumjs-testrpc")
var server = TestRPC.server()
server.listen(8550, function (err, blockchain) {
  console.log(blockchain)
})