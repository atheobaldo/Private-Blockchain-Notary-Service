/* ===== Request Object Class ======================
|  Class with a constructor for Request Object 	   |
|  ===============================================*/

const defaultWindow = 300;

class ValidationRequest {
	constructor(address){
		this.address = address;		
		this.requestTimeStamp = this.currentTimeStamp();
		this.message = this.generateMessage();
		this.validationWindow = defaultWindow;
	}

	// get remaining time window

	getRemainingTimeWindow(){
		return (parseInt(this.requestTimeStamp, 10) + defaultWindow) - this.currentTimeStamp();
	}
	
	// Check if request is still valid

	isRequestValid(){
		return this.getRemainingTimeWindow() >= 0;
	}
	
}

module.exports.ValidationRequest = ValidationRequest;
