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
        DBUtils.deleteContract(contractId)
        DBUtils.deleteBidsByContractId(contractId)
        DBUtils.deleteWinsByContractId(contractId)
    }

    static deleteContract(contractId) {
        DBUtils.deleteByKey("Contract", contractId)
    }

    static deleteBidsByContractId(contractId) {
        const COL = "Bid"
        const query = datastore
            .createQuery(COL)

        datastore.runQuery(query)
            .then(results => {
                let arr = results[0]
                if (arr) {
                    if (arr.length == 0) {
                        console.log("Found 0 bids.")
                        return Promise.resolve()
                    } else {
                        console.log("Found " + arr.length + " bids")
                    }
                }
                for (const a of arr) {
                    if (a.contractId === contractId) {
                        console.log("Found a bid to delete")
                        DBUtils.deleteByKey(COL, a._id)
                    }
                }
                return Promise.resolve()
            })
            .catch(erro => {
                res.status(500).send(erro)
                return Promise.resolve()
            })
    }

    static deleteWinsByContractId(contractId) {
        const COL = "Win"
        const query = datastore
            .createQuery(COL)

        datastore.runQuery(query)
            .then(results => {
                let arr = results[0]
                if (arr) {
                    if (arr.length == 0) {
                        console.log("Found 0 wins.")
                        return Promise.resolve()
                    } else {
                        console.log("Found " + arr.length + " wins")
                    }
                }
                for (const a of arr) {
                    if (a.contractId === contractId) {
                        console.log("Found a win to delete")
                        DBUtils.deleteByKey(COL, a._id)
                    }
                }
                return Promise.resolve()
            })
            .catch(erro => {
                res.status(500).send(erro)
                return Promise.resolve()
            })
    }


    static deleteByKey(col, id) {
        const taskKey = datastore.key([col, id]);
        datastore.delete(taskKey)
            .then(() => {
                console.log(`Deleted a ${col} with ID: ${id}.`);
            })
            .catch(err => {
                console.error('ERROR:', err);
            });

    }


}

class SimpleHttpResponder {

    static handleGet(req, res) {

        console.log("Got to handleGet")

        const query = datastore.createQuery("Contract")
        datastore.runQuery(query)
            .then(results => {
                let arr = results[0]
                if (arr) {
                    if (arr.length == 0) {
                        console.log("Found 0 contracts.")
                        return Promise.resolve()
                    } else {
                        console.log("Found " + arr.length + " contracts")
                    }
                }

                console.log("Got to handleGet: got results ")
                for (const a of arr) {
                    let now = new Date()
                    if (now > a.runUntil) {
                        DBUtils.cleanup(a._id)
                    }
                }
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
