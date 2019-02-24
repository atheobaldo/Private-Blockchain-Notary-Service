/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256       = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const BlockClass   = require('./Block.js');
const db           = new LevelSandbox.LevelSandbox();

class Blockchain {

    constructor() {     
        this.generateGenesisBlock();
    }

    /**
     * Helper method to create a Genesis Block (always with height= 0)
     */

    generateGenesisBlock(){ 
        this.getBlockHeight().then((height) => {
            if(height === 0){
                const genesis = new BlockClass.Block('First block in the chain - Genesis block');

                this.addBlock(genesis)
                    .then((result) => { return result; } )
                    .catch((err)   => { return err;    } );

            }
        }).catch((err) => { console.log(err); });
    }

    /**
     * Get block height, it is a helper method that return the height of the blockchain
     */

    async getBlockHeight() {
        return new Promise((resolve, reject) => { 
            db.getBlocksCountFromDBData()
              .then((result) => { resolve( result ); })
              .catch((err)   => { reject(err);       });
        });
    }

    /**
     * Add new block
     */

    async addBlock(block) {
        return new Promise((resolve, reject) => {
            let newblock = block;

            this.getBlockHeight()
                .then((height) => {                 
                    newblock.height    = height; 
                    newblock.timeStamp = new Date().getTime().toString().slice(0,-3);

                    if(newblock.height > 0){
                        this.getBlockByIndex(newblock.height-1)
                            .then((previousBlock) => { 
                                newblock.body.star.story = Buffer.from(newblock.body.star.story, 'ascii').toString('hex');

                                if (newblock.body.star.story.length > 500)   {
                                    reject(JSON.stringify({error: "The 'story' element is limited to 500 bytes (converted to HEX). Your story is " + newblock.body.star.story.length + ' bytes long (in HEX)'}));
                                    return null;
                                }

                                newblock.previousHash = previousBlock.hash; 
                                newblock.hash = SHA256(JSON.stringify(newblock)).toString();

                                db.addBlockToDBData(newblock.height, JSON.stringify(newblock).toString())
                                  .then((result) => { resolve(result);  })
                                  .catch((err)   => { reject(err);      }); 

                            }).catch((err)   => { reject(err); }); 
                    } else {
                        newblock.hash = SHA256(JSON.stringify(newblock)).toString();
                        
                        db.addBlockToDBData(newblock.height, JSON.stringify(newblock).toString())
                          .then((result) => { resolve(result); })
                          .catch((err)   => { reject(err);     }); 
                    }
                })
                .catch((err) => { 
                    reject(err); });   
        });
      }

    /**
     * Get Block By Height
     */
    
    async getBlockByIndex(height) {
        return new Promise((resolve, reject) => { 
            db.getBlockByIndexFromDBData(height)
                .then((block) => { resolve(block); })
                .catch((err)  => { reject(err); });
        });
    }

    /**
     * Get block by hash
     */
    
    async getBlockByHash(hash) {
        return new Promise((resolve, reject) => {  
            db.getBlockByHashFromDBData (hash)
                .then((block) => { resolve(block); })
                .catch((err)  => { reject(err); });
        });
    }

    /**
     * Get block by address
     */
    
    async getBlockByWallet(address) {
        return new Promise((resolve, reject) => { 
            db.getBlockByWalletFromDBData(address)
                .then((blocks) => { 
                    resolve(blocks); })
                .catch((err)  => { reject(err); });            

        });
    }
 
    /**
    * Decoded story to ascii
    */


}

module.exports.Blockchain = Blockchain;
