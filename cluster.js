const cluster = require('cluster')
const numCPUs = require('os').cpus().length

class ParallelJob {
    start() {
        if (cluster.isWorker) {
            process.on('message', function (msg) {
                console.log('Worker received from master.', msg)
                process.send('Task done')
            })
        }

        if (cluster.isMaster) {
            for (var i = 0; i < numCPUs; i++) {
                cluster.fork()
            }

            this.workers = cluster.workers

            for (let workid of Object.keys(this.workers)) {
                let worker = this.workers[workid]
                worker.on('message', function (msg) {
                    console.log('Master received from worker:', msg)
                })
            }

            for (let workid of Object.keys(this.workers)) {
                let worker = this.workers[workid]
                worker.send('This is your task')
            }
        }
    }
}

module.exports = {
    start: new ParallelJob().start()
}