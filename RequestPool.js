const RequestValidationClass = require('./RequestValidation.js');
const level                  = require('level');
const requestDB              = './requestData';
const db                     = level(requestDB);
const bitcoinMessage         = require('bitcoinjs-message');

class RequestPool {

    /**
     * Get a request by address
     */

    async getRequestByAddress(address) { 
    	return new Promise((resolve, reject) => { 
            db.get(address, (err, data) => {
                if(err)
                    resolve(null);
                else 
                    resolve(JSON.parse(data));  
            });
		}); 
    }

    /**
     * Remove a request by address
     */

	async removeRequestValidation(address) { 
	    	return new Promise((resolve, reject) => { 
				db.del(address).then((value)=>{
					reject(JSON.parse( JSON.stringify({'removeRequestValidation' : 'Request for address ' + address + 'removed.'} ).toString()));
				}).catch((err => {
					reject(JSON.parse( JSON.stringify({'error' : err.message} ).toString()));
				}));
			}); 
	    }

	/**
     * Add a new valid request 
     */

	async addRequestValidation(address){
		return new Promise((resolve, reject) => { 
			let validationRequest = new RequestValidationClass.RequestValidation(address);

			this.getRequestByAddress(address)
                .then((request) => { 
                	if(request !== null){
						validationRequest.requestTimeStamp = request.requestTimeStamp;
						validationRequest.message          = request.message;
						validationRequest.validationWindow = request.validationWindow;

						if(validationRequest.isRequestValid()){
							validationRequest.validationWindow = validationRequest.getRemainingTimeWindow();
						}
						else{
							validationRequest = new RequestValidationClass.RequestValidation(address); 
						}
                	}
                	else{                		
                		  validationRequest = new RequestValidationClass.RequestValidation(address);           	
                	}

					db.put(address, JSON.stringify(validationRequest)).then((value)=>{
						resolve(JSON.stringify(validationRequest));
					}).catch((err => {
						reject(resolve(JSON.parse( JSON.stringify({'error' : err.message} ).toString())));
					}));
                }).catch((err)   => { 
			        resolve(JSON.stringify( 
			        	{
				            RequestValidation: false,
				            error: err.message
				        }).toString());
                 }); 

		});

	}

	/**
     * Valid message
     */

	async validateRequestByWallet(data){
		return new Promise((resolve, reject) => { 
			const dataAux   = JSON.parse(data);
		  	const address   = dataAux.address;
		    const signature = dataAux.signature;			

			this.getRequestByAddress(address)
                .then((request) => { 
                	if(request !== null){
                		let existingValidationReq = request;

                		let existingVR = new RequestValidationClass.RequestValidation(request.address);
						existingVR.requestTimeStamp = request.requestTimeStamp;
						existingVR.message          = request.message;
						existingVR.validationWindow = request.validationWindow;

						if(existingVR.isRequestValid()){
							try{
								let verified = bitcoinMessage.verify(existingVR.message, address, signature);

								if(verified){
									let jsonResponse = {
											"registerStar": true,
											"status": {
												"address": address,
												"requestTimeStamp": existingVR.requestTimeStamp,
												"message": existingVR.message,
												"validationWindow": existingVR.validationWindow,
												"messageSignature": true
											}
										};

									db.put(address, JSON.stringify(jsonResponse)).then((value)=>{
										resolve(JSON.stringify(jsonResponse));
									}).catch((err => {
										resolve(JSON.stringify( 
											{
										        ValidateRequest: false,
										        error: 'Validation Request could not be added.'
										    }).toString());
									}));

								}else{
									resolve(JSON.stringify( 
										{
									        ValidateRequest: false,
									        error: 'Message could not be verified with Address and Signature.'
									    }).toString());
								}
							}catch(err){
								resolve(JSON.stringify( 
									{
								        ValidateRequest: false,
								        error: 'Message could not be verified with Address and Signature.'
								    }).toString());

							}

						} else {
							resolve(JSON.stringify( 
				        	{
					            RequestValidation: false,
					            error: 'Timeout, please request validation message again.'
					        }).toString());
						}

                	} else {
				        resolve(JSON.stringify( 
				        	{
					            RequestValidation: false,
					            error: 'No validation request is found. Please create validation request first.'
					        }).toString());
                	}

                }).catch((err)   => { 
			        resolve(JSON.stringify( 
			        	{
				            RequestValidation: false,
				            error: 'Validation request could not be found with given address.'
				        }).toString());
                 }); 
		});
	}

}

module.exports.RequestPool = RequestPool;
