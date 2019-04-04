/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/

  '*': true,

  UserController: {
    '*': true,
    update: [ 'sessionAuth' ],
    me: [ 'sessionAuth' ],
    regenerateSigningSecret: [ 'sessionAuth' ]
  },

  AuthController: {
    '*': true,
    logout: [ 'sessionAuth' ],
    disconnect: [ 'sessionAuth' ]
  },

  TargetController: {
    '*': [ 'sessionAuth' ]
  },

  PublishKeyController: {
    '*': [ 'sessionAuth' ]
  },

  BooksController: {
    '*': true,
    publish: [ 'keyAuth' ]
  },

  AdminController: {
    '*': [ 'sessionAuth', 'adminAuth' ]
  }
}
