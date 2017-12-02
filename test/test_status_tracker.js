 var expect    = require("chai").expect
 var statusTracker = null
 var unixSecond =  Math.floor(new Date() / 1000)
 describe("updateStatus", function() {

   beforeEach(function () {
     statusTracker = new (require("../status_tracker"))()
   })

   context("the ping came from a new service", function () {
     it("should add the service to the status tracker", function() {
       var serviceName = 'update-balance-service'
       var instancePort = 12345
       statusTracker.updateStatus(serviceName, instancePort, unixSecond)
       expect(statusTracker.theStatus).to.deep.equal({
         'numberOfServices': 1,
         'services': [{
           'name': serviceName,
           'numberOfInstances':1,
           'instances': [{
             'port': instancePort,
             'initialPing': unixSecond,
             'lastPing': unixSecond
           }]
         }]
       })
     })
   })

   context("the ping came from an existing service but a new instance", function () {
     it("should add the instance to the status tracker", function() {
       var serviceName = 'update-balance-service'
       var instancePort = 12345
       statusTracker.theStatus = {
         'numberOfServices': 1,
         'services': [{
           'name': serviceName,
           'numberOfInstances':1,
           'instances': [{
             'port': instancePort,
             'initialPing': unixSecond,
             'lastPing': unixSecond
           }]
         }]
       }
       var newInstancePort = instancePort + 1
       var newUnixSecond = unixSecond + 1
       statusTracker.updateStatus(serviceName, newInstancePort, newUnixSecond)
       expect(statusTracker.theStatus).to.deep.equal({
         'numberOfServices': 1,
         'services': [{
           'name': serviceName,
           'numberOfInstances':2,
           'instances': [{
             'port': instancePort,
             'initialPing': unixSecond,
             'lastPing': unixSecond
           }, {
             'port': newInstancePort,
             'initialPing': newUnixSecond,
             'lastPing': newUnixSecond
           }]
         }]
       })
     })
   })

   context("the ping came from an existing instance", function () {
     it("should update the instance's timestamp'", function() {
       var serviceName = 'update-balance-service'
       var instancePort = 12345
       statusTracker.theStatus = {
         'numberOfServices': 1,
         'services': [{
           'name': serviceName,
           'numberOfInstances':1,
           'instances': [{
             'port': instancePort,
             'initialPing': unixSecond,
             'lastPing': unixSecond
           }]
         }]
       }
       var newUnixSecond = unixSecond + 1
       statusTracker.updateStatus(serviceName, instancePort, newUnixSecond)
       expect(statusTracker.theStatus).to.deep.equal({
         'numberOfServices': 1,
         'services': [{
           'name': serviceName,
           'numberOfInstances':1,
           'instances': [{
             'port': instancePort,
             'initialPing': unixSecond,
             'lastPing': newUnixSecond
           }]
         }]
       })
     })
   })

})

describe("removeInactive", function() {

  beforeEach(function () {
    statusTracker = new (require("../status_tracker"))()
  })

  context("there is one service with one active instance", function () {
    specify("the service/instance should not be removed", function functionName() {
      var serviceName = 'update-balance-service'
      var instancePort = 12345
      statusTracker.theStatus = {
        'numberOfServices': 1,
        'services': [{
          'name': serviceName,
          'numberOfInstances':1,
          'instances': [{
            'port': instancePort,
            'initialPing': unixSecond,
            'lastPing': unixSecond
          }]
        }]
      }
      statusTracker.removeInactive(unixSecond, 1)
      expect(statusTracker.theStatus).to.deep.equal({
        'numberOfServices': 1,
        'services': [{
          'name': serviceName,
          'numberOfInstances':1,
          'instances': [{
            'port': instancePort,
            'initialPing': unixSecond,
            'lastPing': unixSecond
          }]
        }]
      })
    })
  })

  context("there is one service with one inactive instance", function () {
    specify("the service/instance should be removed", function functionName() {
      var serviceName = 'update-balance-service'
      var instancePort = 12345
      statusTracker.theStatus = {
        'numberOfServices': 1,
        'services': [{
          'name': serviceName,
          'numberOfInstances':1,
          'instances': [{
            'port': instancePort,
            'initialPing': unixSecond,
            'lastPing': unixSecond
          }]
        }]
      }
      statusTracker.removeInactive(unixSecond + 2, 1)
      expect(statusTracker.theStatus).to.deep.equal({
        'numberOfServices': 0,
        'services': []
      })
    })
  })

  context("there is one service with one active instance and one inactive instance", function () {
    specify("the service should not be removed, but the inactive instance should be removed", function functionName() {
      var serviceName = 'update-balance-service'
      var instancePort = 12345
      var newInstancePort = instancePort + 1
      var newUnixSecond = unixSecond + 2
      statusTracker.theStatus = {
        'numberOfServices': 1,
        'services': [{
          'name': serviceName,
          'numberOfInstances':1,
          'instances': [{
            'port': instancePort,
            'initialPing': unixSecond,
            'lastPing': unixSecond
          }, {
            'port': newInstancePort,
            'initialPing': unixSecond,
            'lastPing': newUnixSecond
          }]
        }]
      }
      statusTracker.removeInactive(newUnixSecond, 1)
      expect(statusTracker.theStatus).to.deep.equal({
        'numberOfServices': 1,
        'services': [{
          'name': serviceName,
          'numberOfInstances':1,
          'instances': [{
            'port': newInstancePort,
            'initialPing': unixSecond,
            'lastPing': newUnixSecond
          }]
        }]
      })
    })
  })
  
})
