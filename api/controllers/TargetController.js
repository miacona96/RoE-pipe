'use strict'
const HttpError = require('../errors/HttpError')

module.exports = {
  show: function (req, res) {
    res.view('pages/app', {
      email: req.user.email
    })
  },
  create: async function (req, res) {
    try {
      const url = await TargetUrl.create({
        user: req.user.id
      }).fetch()
      return res.json(url)
    } catch (e) {
      return (new HttpError(500, e.message)).send(res)
    }
  },
  edit: async function (req, res) {
    try {
      const id = req.param('id')
      const value = req.param('url')
      const author = req.param('author') || ''
      const publisher = req.param('publisher') || ''
      const title = req.param('title') || ''
      const isbn = req.param('isbn') || ''
      const tags = req.param('tags') || ''
      if (value.length) {
        const url = await TargetUrl.update({ id, user: req.user.id }, {
          url: value,
          author,
          publisher,
          title,
          isbn,
          tags: JSON.stringify(tags.split(/,\s*/))
        }).fetch()
        return res.json(url)
      } else {
        return new HttpError(400, 'URL cannot be blank.').send(res)
      }
    } catch (e) {
      return (new HttpError(500, e.message)).send(res)
    }
  },
  delete: async function (req, res) {
    try {
      const id = +req.param('id')
      await TargetUrl.destroyOne({ id })
      return res.status(204).send()
    } catch (e) {
      return (new HttpError(500, e.message)).send(res)
    }
  },
  list: async function (req, res) {
    try {
      let urls = await TargetUrl.find({
        user: req.user.id
      })
      urls = urls.map(url => ({
        ...url,
        tags: JSON.parse(url.tags || '[]')
      }))
      return res.json(urls)
    } catch (e) {
      return (new HttpError(500, e.message)).send(res)
    }
  }
}
