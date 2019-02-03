/* ===== Request Object Class ======================
|  Class with a constructor for Request Object 	   |
|  ===============================================*/

class Block {
	constructor(parWalletAddress, parRequestTimeStamp, parMessage, parValidationWindow){
		this.walletAddress = parWalletAddress;
		this.requestTimeStamp = parRequestTimeStamp;
		this.message = parMessage;
		this.validationWindow = parValidationWindow;
	}
}

module.exports.Block = Block;