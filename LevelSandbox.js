/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level   = require('level');
const chainDB = './chaindata';
const db      = level(chainDB);

class LevelSandbox {

    constructor() { }


    // Get data from levelDB with key (Promise)
    async getBlockByIndexFromDBData(key) { 
        return new Promise(function(resolve, reject) {
            db.get(key, (err, data) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve( JSON.parse( JSON.stringify( { 'error' : "Block: " + key + " not found!" } ).toString()) );
                    }else {
                        reject(err);
                    }
                }else { 
                    resolve(JSON.parse(data));
                }
            });
        });
    }


    // Get data from levelDB with hash (Promise)
    async getBlockByHashFromDBData(hash) {
        let block = null;
        return new Promise(function(resolve, reject){
            db.createReadStream()
            .on('data', function (result) {
                let data = JSON.parse(result.value);

                if(data.hash === hash)               
                    block = data;
            })
            .on('error', function (err) {
                reject(resolve(JSON.parse( JSON.stringify({'error' : err.message} ).toString())));
            })
            .on('close', function () {
                if(block === null){
                    resolve(JSON.parse( JSON.stringify({ 'error': 'Hash: ' + hash + ' not found!'}).toString()));
                }
                else
                    resolve(block);
            });
        });
    }

    // Get data from levelDB with adress (Promise)
    async getBlockByWalletFromDBData(address) {
        let blocks = [];

        return new Promise(function (resolve, reject) {
            db.createReadStream()
            .on('data', function (result) {

                let data = JSON.parse(result.value);
                if (data.height > 0 && data.body.address === address) {
                    blocks.push(data);
                }
            })
            .on('error', function (err) {
                reject(resolve(JSON.parse( JSON.stringify({'error' : err.message} ).toString())));
            })
            .on('close', () => {
                resolve(blocks);
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    async addBlockToDBData(key, value) {
        return new Promise(function(resolve, reject) {

            db.put(key, value, function(err) {
                if (err) {
                    reject(resolve(JSON.parse( JSON.stringify({'error' : err.message} ).toString())));
                }
                resolve(value);
            });
        });
    }

    // Method that return the height
    async getBlocksCountFromDBData() {
        return new Promise(function(resolve, reject) {
            let count = 0;
            db.createReadStream()
              .on('data', function(data) {
                count++;
              })
              .on('error', function(err) {
                reject(resolve(JSON.parse( JSON.stringify({'error' : err.message} ).toString())));
              })
              .on('close', function() {
                resolve(count);
              });
      });
    }    

}


module.exports.LevelSandbox = LevelSandbox;
