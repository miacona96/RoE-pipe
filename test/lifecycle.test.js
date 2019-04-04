//var SailsApp = require('sails').Sails
//var sails = new SailsApp()
var sails = require('sails')
var _ = require('lodash')
require('../config/env/development')

global.chai = require('chai')
global.should = chai.should()

// Before running any tests...
before(function (done) {
  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout(5000)

  sails.lift({
    // Your sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:
    hooks: { grunt: false },
    log: { level: 'warn' },

    
    models: {
      connection: 'postgresDev',
      migrate: 'safe'
    },
    
    /*
    connections: {
      unitTestConnection: {
        adapter: 'sails-postgresql'
      }
    }
    */
    
  }, 
  function (err, sails) {
    if (err) { 
      console.log('Error occurred loading Sails app:', err);
      return done(err) 
    }
    // here you can load fixtures, etc.
    // (for example, you might want to create some records in the database)

    done(err, sails)
  })
})

// After all tests have finished...
after(function (done) {
  // here you can clear fixtures, etc.
  // (e.g. you might want to destroy the records you created above)
  if (sails && _.isFunction(sails.lower)) {
    sails.lower(done)
  }
})
