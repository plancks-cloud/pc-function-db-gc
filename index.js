'use strict'

const Datastore = require('@google-cloud/datastore')
const datastore = Datastore()
const uuid = require('uuid')

const OK_JSON = JSON.stringify({
  ok: true
})

function fancyOk() {
  return JSON.stringify({
    ok: true,
    signature: new Date()
  })
}

exports.handle = (req, res) => {

  if (req.method == "OPTIONS") {
    res.writeHead(200, {
      "Accept": "Content-type"
    })
    res.end(fancyOk)
    return Promise.resolve()

  }


  if (req.method == "POST") {
    return SimpleHttpResponder.handlePost(req, res)
  }
  if (req.method == "GET") {
    return SimpleHttpResponder.handleGet(req, res)
  }
}

class SimpleHttpResponder {

  static getField(obj, fieldName) {
    return obj[fieldName]
  }

  static handlePost(req, res) {

    /*
    Expects:
    body = {
      collection: "collectionName",
      index: "idFieldName",
      indexes: [], //TODO
      rows = [
        {field: value},
        {}
      ]
    }
    */

    const results = []
    for (const row of req.body.rows) {
      const key = datastore.key([req.body.collection, SimpleHttpResponder.getField(row, req.body.index)])
      const subEntity = []
      for (var r in row) {
        const newObject = {
          name: r,
          value: SimpleHttpResponder.getField(row, r),
        }
        if (newObject.name !== req.body.index) {
          newObject.excludeFromIndexes = true
        }
        subEntity.push(newObject)
      }
      const entity = {
        key: key,
        data: subEntity
      }
      SimpleHttpResponder.save(entity)

    }

    res.writeHead(200, {
      "Content-type": "Application/json"
    })
    res.end(fancyOk)
    return Promise.resolve()


  }

  static save(entity) {
    datastore.save(entity)
      .then(() => {

      })
      .catch((err) => {

      })

  }

  static handleGet(req, res) {
    const query = datastore
      .createQuery(req.query.collection)
    datastore.runQuery(query)
      .then(results => {
        res.writeHead(200, {
          "Content-type": "Application/json"
        })
        res.end(JSON.stringify(results[0]))
        return Promise.resolve()
      })
      .catch(erro => {
        res.status(500).send(erro)
        return Promise.resolve()
      })
  }

}
