const { generateToken } = require('../util')

module.exports = {
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    user: {
      model: 'User',
      required: true
    },
    name: {
      type: 'string',
      required: true
    },
    url: 'string',
    whitelisted: 'boolean',
    verified: 'boolean',
    verification_key: 'string',
    appid: {
      type: 'string'
    },
    secret: {
      type: 'string'
    }
  },
  beforeCreate: async function (key, next) {
    key.appid = await generateToken({ bytes: 12 })
    key.secret = await generateToken({ bytes: 48 })
    key.verification_key = await generateToken({ bytes: 24, base: 'hex' })
    next()
  },
  beforeUpdate: async function (key, next) {
    key.secret = await generateToken({ bytes: 48 })
    next()
  }
}
