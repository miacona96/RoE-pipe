// Passport protocol configurations
const crypto = require('crypto')
const base64URL = require('base64url')

module.exports.protocols = {
  local: {
    /**
     * Validate a login request
     *
     * Looks up a user using the supplied identifier (email or username) and then
     * attempts to find a local Passport associated with the user. If a Passport is
     * found, its password is checked against the password supplied in the form.
     *
     * @param {Object}   req
     * @param {string}   identifier
     * @param {string}   password
     * @param {Function} next
     */
    login: async function (req, identifier, password, next) {
      if (!validateEmail(identifier)) {
        return next(new Error('invalid email address'), false)
      }
      try {
        const user = await User.findOne({
          email: identifier
        })
        if (!user) throw new Error('an account with that email was not found')

        const passport = await Passport.findOne({
          protocol: 'local',
          user: user.id
        })
        if (passport) {
          const res = await Passport.validatePassword(password, passport)
          if (!res) throw new Error('incorrect password')
          return next(null, user)
        } else {
          throw new Error('that account does not have password login enabled')
        }
      } catch (e) {
        return next(e, false)
      }
    },
    register: async function (user, next) {
      try {
        const token = generateToken()
        const password = user.password
        if (!password.length) throw new Error('password cannot be blank')
        delete user.password

        const newUser = await User.create(user).fetch()
        try {
          await Passport.create({
            protocol: 'local',
            password,
            user: newUser.id,
            accesstoken: token
          })
          return next(null, token)
        } catch (e) {
          await User.destroy(newUser.id)
          throw e
        }
      } catch (e) {
        return next(e)
      }
    },
    update: async function (user, next) {
      try {
        const dbUser = await User.findOne({
          id: user.id
        })
        if (!dbUser) throw new Error('An account with that id was not found.')

        const passport = await Passport.findOne({
          protocol: 'local',
          user: user.id
        })
        if (!user.currentPassword && passport) throw new Error('Please enter your current password.')
        if (passport) {
          const res = await Passport.validatePassword(user.currentPassword, passport)
          if (!res) throw new Error('incorrect password')

          const otherUser = await User.findOne({ email: user.email })
          if (otherUser && otherUser.id !== dbUser.id) throw new Error('There is already an account with that email.')
          await User.update({ id: user.id }, {
            email: user.email
          })
          if (user.password && user.password.length) {
            await Passport.update({ id: passport.id }, {
              password: user.password
            })
          }
        } else { // no password yet, add one
          const otherUser = await User.findOne({ email: user.email })
          if (otherUser && otherUser.id !== dbUser.id) throw new Error('There is already an account with that email.')
          await User.update({ id: user.id }, {
            email: user.email
          })
          if (user.password && user.password.length) {
            const token = generateToken()
            await Passport.create({
              protocol: 'local',
              password: user.password,
              user: dbUser.id,
              accesstoken: token
            })
          }
        }
        delete dbUser.password
        next(null, dbUser)
      } catch (e) {
        return next(e)
      }
    },
    connect: async function (req, res, next) {
      try {
        const user = req.user
        const password = req.param('password')

        const pass = await Passport.findOne({
          protocol: 'local',
          user: user.id
        })
        if (!pass) {
          await Passport.create({
            protocol: 'local',
            password,
            user: user.id
          })
        } else {
          return next(null, user)
        }
      } catch (e) {
        return next(e)
      }
    }
  },
  oauth2: {
    login: async function (req, accessToken, refreshToken, profile, next) {
      try {
        const passportHelper = await sails.helpers.passport()
        await passportHelper.connect(req, {
          tokens: {
            accessToken,
            refreshToken
          },
          identifier: profile.id,
          protocol: 'oauth2'
        }, profile, next)
      } catch (e) {
        return next(e, false)
      }
    }
  }
}

const EMAIL_REGEX = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i

function validateEmail (email) {
  return EMAIL_REGEX.test(email)
}

function generateToken () {
  return base64URL(crypto.randomBytes(48))
}
