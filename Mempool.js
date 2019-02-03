const bitcoinMessage = require('bitcoinjs-message');

const delay      = 300;
let mempool      = [];
let mempoolValid = [];

class Mempool {

	async addRequestValidation(address){
		return new Promise(function(resolve, reject) {
    		let currentTime = Math.round(+new Date / 1000);

		    if (!mempool[address] || ((mempool[address] + delay) < currentTime)) {
		        mempool[address] = currentTime;
		        setTimeout(() => {
		            delete mempool[address];
		            delete mempoolValid[address];
		        }, delay * 1000);
		    }

		    const requestObject = {
		        walletAddress:    address,
		        requestTimeStamp: mempool[address],
		        message:          [address, mempool[address], 'starRegistry'].join(':'),
		        validationWindow: mempool[address] + delay - currentTime
		    };

		    console.log(mempool);
		    resolve(resolve(JSON.stringify(requestObject).toString()));
		});

	}

	async validateRequestByWallet(data){
		return new Promise(function(resolve, reject) {
			const dataAux = JSON.parse(data);

		  	const address   = dataAux.address;
		    const signature = dataAux.signature;

		    const timestamp = mempool[address];

		    if (timestamp === undefined) {
		        resolve(JSON.stringify( 
		        	{
			            registerStar: false,
			            error: 'Timeout, please request validation message again'
			        }).toString()
		        ); 

		        return null;
		    }

		    const message  = [address, timestamp, 'starRegistry'].join(':');
			let   response = null;

		    try {
		    	let isValid = bitcoinMessage.verify(message, address, signature);	    	
		        if (isValid) {
			        const validationWindow = timestamp + delay - Math.round(+new Date/1000);
			        mempoolValid[address]  = true;

			        response = {
			          	registerStar: true,
			            status: {
			                address: address,
			                requestTimeStamp: timestamp,
			                message: message,
			                validationWindow: validationWindow,
			                messageSignature: true
	        			}
			        };
			    } else {
			        response = {
			            registerStar: false,
			            error: 'message is invalid'
			        };
			        
			    }

			    resolve( JSON.stringify(response).toString() );

		    } catch(e) {
		         let response = {
		            registerStar: false,
		            error:        e.message
		        };

		        reject( JSON.stringify(response).toString() );

		    }

		});
	}

}

module.exports.Mempool = Mempool;
