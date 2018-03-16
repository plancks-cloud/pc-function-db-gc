'use strict'

const Datastore = require('@google-cloud/datastore')
const datastore = Datastore()
const uuid = require('uuid')


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

class FieldUtils {
  static getField(obj, fieldName) {
    return obj[fieldName]
  }

}

class DBUtils {

  static save(entity) {
    datastore.save(entity)
      .then(() => {

      })
      .catch((err) => {

      })
  }

}

class SimpleHttpResponder {


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

      const key = datastore.key([req.body.collection, FieldUtils.getField(row, req.body.index)])
      const subEntity = []
      for (var r in row) {
        const newObject = {
          name: r,
          value: FieldUtils.getField(row, r),
        }
        if (newObject.name !== req.body.index && SimpleHttpResponder.notIn(newObject.name, req.body.indexes)) {
          newObject.excludeFromIndexes = true
        }
        subEntity.push(newObject)
      }

      DBUtils.save({
        key: key,
        data: subEntity
      })

    }

    res.writeHead(200, {
      "Content-type": "Application/json"
    })
    res.end(fancyOk)
    return Promise.resolve()


  }

  static notIn(v, arr) {
    return !arr || !v || arr.indexOf(v)

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
