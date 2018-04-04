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

    if (req.method == "GET") {
        return SimpleHttpResponder.handleGet(req, res)
    }

}

class DBUtils {

    static cleanup(contractId) {
        console.log("123: Going to cleanup: " + contractId)
    }

}

class SimpleHttpResponder {

    static handleGet(req, res) {

        console.log("Got to handleGet")

        const query = datastore.createQuery("Contract")

        datastore.runQuery(query)
            .then(results => {
                let arr = results[0]
                console.log("Got to handleGet: got results ")
                console.log(results)
                for (const a of arr) {
                    let now = new Date()
                    if (now > a.runUntil) {
                        DBUtils.cleanup(a._id)
                    }
                }
                res.status(200).send(fancyOk())
                return Promise.resolve()
            })
            .catch(erro => {
                res.status(500).send(erro)
                return Promise.resolve()
            })


        res.status(200).send(fancyOk())
        return Promise.resolve()

    }

}
