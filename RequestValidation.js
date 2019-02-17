const defaultWindow = 300;

class RequestValidation {
	
	constructor(address){
		this.address 		  = address;		
		this.requestTimeStamp = this.currentTimeStamp();
		this.message 		  = this.getMessage();
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
	
	// generate request message

	getMessage(){
		return this.address + ":" + this.requestTimeStamp +":" + "starRegistry";
	}

	currentTimeStamp(){
		return new Date().getTime().toString().slice(0,-3);
	}

}

module.exports.RequestValidation = RequestValidation;