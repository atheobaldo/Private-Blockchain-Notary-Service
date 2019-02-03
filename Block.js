/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		this.height       = '';
		this.timeStamp    = '';
		this.body         = data;
		this.previousHash = '';
		this.hash         = '';
	}

	    mapperFromJson(data) {
        this.hash = data.hash;
        this.height = data.height;
        this.body = data.body;
        this.timeStamp = data.time;
        this.previousHash = data.previousBlockHash;
    }
}

module.exports.Block = Block;