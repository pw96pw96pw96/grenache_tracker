const fs = require('fs')
const Grenache = require('grenache-nodejs-http')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCServer

const _ = require('lodash')
const statusTracker = new (require('./status_tracker'))()
const removeThresholdSecond = 60 // if an instance is older than removeThresholdSecond, it is considered to be 'dead' and removed from the 'currentStatus' variable

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {
  timeout: 300000
})
peer.init()

const service = peer.transport('server')

service.on('request', (rid, key, payload, handler) => {
  if (!rid || !key || !payload) {
    handler.reply(new Error('request-id/key/payload cannot be empty'), null)
    return
  }
  if (payload[0] !== 'ping') {
    handler.reply(new Error('unsupported operation'), null)
    return
  }
  if (!payload[1] || !payload[1]['name'] || !payload[1]['port']) {
    handler.reply(new Error('please provide the name of the service and/or the port on which it is running'), null)
    return
  }
  var unixSecond = Math.floor(new Date() / 1000)
  statusTracker.updateStatus(payload[1]['name'], payload[1]['port'], unixSecond)
  console.log('statusTracker.theStatus = ' + JSON.stringify(statusTracker.theStatus, null, 2))
  handler.reply(null, 'pong: status has been updated')
})

service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rest:tracker', service.port, {})
}, 1000)

setInterval(function () {
  var unixSecondNow = Math.floor(new Date() / 1000)
  statusTracker.removeInactive(unixSecondNow, removeThresholdSecond)
  console.log('will write to disk')
  fs.writeFile('./microservice_status.json', JSON.stringify(statusTracker.theStatus, null, 2), function (err) {
      if (err) {
        console.log(err)
      }
  })
}, 3000)
