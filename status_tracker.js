
function StatusTracker(initialStatus) {
  // this.theStatus generally looks like:
  // this.theStatus = {
  //   'numberOfServices': 1, // numberOfServices is here for convenience, it can be computed from 'services' array
  //   'services': [{
  //     'name': 'update-balance',
  //     'numberOfInstances':1, // numberOfInstances is here for convenience, it can be computed from 'instances' array
  //     'instances': [{
  //       'port': 12345,
  //       'initialPing': 1512235402, // unix timestamp in seconds
  //       'lastPing': 1512235456 // unix timestamp in seconds
  //     }]
  //   }]
  // }
  this.theStatus = (typeof initialStatus !== 'undefined') ?  initialStatus : {
    'numberOfServices': 0,
    'services': []
  }
}

StatusTracker.prototype.updateStatus = function(serviceName, instancePort, unixSecond) {
  var filteredServices = this.theStatus['services'].filter(service => service['name'] === serviceName)
    if (filteredServices.length == 0) {
      this.theStatus['services'].push({
        'name': serviceName,
        'numberOfInstances':1,
        'instances': [{
          'port': instancePort,
          'initialPing': unixSecond,
          'lastPing': unixSecond
        }]
      })
      this.theStatus['numberOfServices'] += 1
    } else {
      var theService = filteredServices[0]
      var filteredInstances = theService['instances'].filter(instance => instance['port'] === instancePort)
      if (filteredInstances.length == 0) {
        theService['instances'].push({
          'port': instancePort,
          'initialPing': unixSecond,
          'lastPing': unixSecond
        })
        theService['numberOfInstances'] += 1
      } else {
        var theInstance = filteredInstances[0]
        theInstance['lastPing'] = unixSecond
      }
    }
}

// if an instance is older than removeThresholdSecond, it is considered to be 'dead' and removed from the 'theStatus' variable
StatusTracker.prototype.removeInactive = function(unixSecondNow, removeThresholdSecond) {
  for (var i = 0; i < this.theStatus['services'].length; i++) {
    var theService = this.theStatus['services'][i]
    if (theService['instances'] || theService['instances'].length > 0) {
      for (var j = 0; j < theService['instances'].length; j++) {
        var theInstance = theService['instances'][j]
        if (unixSecondNow - theInstance['lastPing'] > removeThresholdSecond) {
          theService['instances'].splice(j, 1);
        }
      }
      if (theService['instances'].length > 0) {
        theService['numberOfInstances'] = theService['instances'].length
      } else {
        this.theStatus['services'].splice(i, 1);
      }
    }
  }
  this.theStatus['numberOfServices'] = this.theStatus['services'].length
}

module.exports = StatusTracker;
