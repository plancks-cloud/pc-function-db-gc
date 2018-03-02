'use strict'

const Datastore = require('@google-cloud/datastore')
const datastore = Datastore()
const uuid = require('uuid')

const OK_JSON = JSON.stringify({
  ok: true
})

exports.handle = (req, res) => {

  if (req.method == "POST") {
    return SimpleHttpResponder.handlePost(req, res)
  }
  if (req.method == "GET") {
    return SimpleHttpResponder.handleGet(req, res)
  }
}

class SimpleHttpResponder {
  static handlePost(req, res) {
    const key = datastore.key(["capacity", req.body.friendlyName])
    const subEntity = [
      {
        name: 'capacity',
        value: req.body.currentPlayers,
        excludeFromIndexes: true,
      },
      {
        name: 'maxPlayers',
        value: req.body.maxPlayers,
        excludeFromIndexes: true,
      },
      {
        name: 'friendlyName',
        value: req.body.friendlyName,
        excludeFromIndexes: true,
      },
      {
        name: 'joinUrl',
        value: req.body.joinUrl,
        excludeFromIndexes: true,
      },
      {
        name: 'lastUpdate',
        value: new Date().getTime(),
      },
    ]

    const entity = {
      key: key,
      data: subEntity
    }

    return datastore.save(entity)
      .then(() => {
        res.writeHead(200, {
          "Content-type": "Application/json"
        })
        res.end(OK_JSON)
        return Promise.resolve()
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send(err.message)
      })
  }

  static handleGet(req, res) {
    const query = datastore
      .createQuery('capacity')
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
