# Private Blockchain Notary Service

In this project, you will build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky. 

Creates a Blockchain dataset that allow you to store a Star:

- The application will persist the data (using LevelDB).
- The application will allow users to identify the Star data with the owner.

Creates a RequestPool component:

- The component will store temporal validation requests for 5 minutes (300 seconds).
- The component will store temporal valid requests for 30 minutes (1800 seconds).
- The component will manage the validation time window.

Creates a REST API that allows users to interact with the application:

- The API will allow users to submit a validation request.
- The API will allow users to validate the request.
- The API will be able to encode and decode the star data.
- The API will allow be able to submit the Star data.
- The API will allow lookup of Stars by hash, wallet address, and height.


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js web site)[https://nodejs.org/en/].

### Configuring your project

- Install dependencies
```
npm install 
```
It includes nodemon, crypto-js, levelDB, express, bodyParser, bitcoinjs-lib, bitcoinjs-message etc 


## How to run and test the app

1) run the server
```
npm start
```

## Endpoints

#### STEP 1

- Web API POST endpoint to validate request with JSON response.

The request should contain:

```
POST http://localhost:8000/requestValidation 
{
    "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
}
```

The response will contain: walletAddress, requestTimeStamp, message and validationWindow. It must be returned in a JSON format:

```
{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544451269",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry",
    "validationWindow": 300
}
```

- Web API POST endpoint validates message signature with JSON response.

Run this command to generate a signature for testing purposes:

```
node sign {a message, for ex. 19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry} 
```

- Send a signed message

```
POST http://localhost:8000/requestValidation 
{
  	"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
  	"signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```

The endpoint response should look like:

{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1544454641",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544454641:starRegistry",
        "validationWindow": 193,
        "messageSignature": true
    }
}

Upon validation, the user is granted access to register a single star.


#### STEP 2

- Web API POST endpoint with JSON response that submits the Star information to be saved in the Blockchain.

Register a Star. Request body shouldn't be empty. Request should be a json with 'body' element.
It should also contain dec, ra and story inside the star element

```
POST http://localhost:8000/block
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```

The response will look like:

```
{
    "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
    "height": 1,
    "body": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "68° 52' 56.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1544455399",
    "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
}
```


#### STEP 3

- Get Star block by hash with JSON response.

Use the URL: 

```
GET http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f
```

The response includes entire star block contents along with the addition of star story decoded to ASCII.

```

{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```


- Get Star block by wallet address (blockchain identity) with JSON response.

Use the URL:

```
http://localhost:8000/stars/address: 142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ
```

The response includes entire star block contents along with the addition of star story decoded to ASCII.

This endpoint response contained a list of Stars because of one wallet address can be used to register multiple Stars.

Response:

```
[
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
]

```


- Get star block by star block height with JSON response.

Use the URL:

```
http://localhost:8000/block/1
```

The response includes entire star block contents along with the addition of star story decoded to ASCII.

```
{
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
}
```

## Built With

(Express)[http://expressjs.com/] - Node.js framework

(BodyParser)[https://www.npmjs.com/package/body-parser] - Node.js middleware 
