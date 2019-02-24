const SHA256           = require('crypto-js/sha256');
const BlockClass       = require('./Block.js');
const BlockChain       = require('./BlockChain.js');
const RequestPoolClass = require('./RequestPool.js');

const { check, validationResult } = require('express-validator/check');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */

    constructor(app) {
        this.myBlockChain     = new BlockChain.Blockchain();
        this.RequestPoolClass = new RequestPoolClass.RequestPool();
        this.app              = app;
        this.postRequestValidation();
        this.postMessageSignatureValidate();
        this.postNewBlock();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.getBlockByWallet();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "http://localhost:8000/block/:index"
     */

    getBlockByIndex() {
        this.app.get("/block/:index", 
        [
            check('index').not().isEmpty().withMessage('Index is required!')
        ], (req, res) => {
            
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }  

            this.myBlockChain.getBlockByIndex(req.params.index)
                .then((block) => { res.send( block ); })
                .catch((err)  => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });  
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "http://localhost:8000/stars/hash:hash"
     */

    getBlockByHash() {
        this.app.get('/stars/hash::hash', 
        [
            check('hash').not().isEmpty().withMessage('Hash is required!')
        ], (req, res) => {
            
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }   

            this.myBlockChain.getBlockByHash(req.params.hash)
                .then((block) => { res.send(block); })
                .catch((err)  => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "http://localhost:8000/stars/address:address"
     */

    getBlockByWallet() {
        this.app.get('/stars/address::address', 
        [
            check('address').not().isEmpty().withMessage('Address is required!')
        ], (req, res) => {

              const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }   

            this.myBlockChain.getBlockByWallet(req.params.address)
                .then((blocks) => { res.send( blocks ); })
                .catch((err)  => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });
        });
    }


    /**
     * Implement a POST Endpoint to add a new Block, url: "http://localhost:8000/block"
     */

    postNewBlock() {
        this.app.post("/block", 
        [
            //check('body').not().isEmpty().withMessage('Body is required!'),
            check('address').not().isEmpty().withMessage('Address is required!'),
            check('star').not().isEmpty().withMessage('Star is required!'),
            check('star.ra').not().isEmpty().withMessage('ra is required!'),
            check('star.dec').not().isEmpty().withMessage('dec is required!'),
            check('star.story').not().isEmpty().withMessage('Story is required!')
        ], (req, res) => {

            let   body = req.body;
            const errors = validationResult(req);

            if (!errors.isEmpty()) 
                return res.status(422).json({ errors: errors.array() });
            
            this.RequestPoolClass.getRequestByAddress(req.body.address)
                .then((result) => { 

                    if(result == undefined || !result.registerStar)
                        res.send( JSON.parse( JSON.stringify({ 'error' : 'No valid request found OR request is timed out OR you have already registerd star using this existing request for address ' + req.body.address +'. Please create one before registering your star.' }).toString() ))
                    else {
                       const newBlock = new BlockClass.Block(body);

                       this.myBlockChain.addBlock(newBlock)
                            .then((resultAdd) => { 
                                this.RequestPoolClass.removeRequestValidation(req.body.address)
                                    .then((resultRemove) => { })
                                    .catch((err)   => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });
                                res.send( JSON.parse(resultAdd));
                            }).catch((err)   => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });
                    }
                })
                .catch((err)   => { return res.json( {'error' : err.message } ) });
        });
    }


    /**
     * Implement a POST Endpoint to add a new request, url: "http://localhost:8000/requestValidation"
     */

    postRequestValidation() {
        this.app.post("/requestValidation", 
        [
            check('address').not().isEmpty().withMessage('Address is required!')
        ], (req, res) => {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            this.RequestPoolClass.addRequestValidation(req.body.address)
                .then((result) => { return res.json( JSON.parse(result) ) })
                .catch((err)   => { return res.json( {'error' : err.message } ) });

        });    
    }



   /**
     * Implement a POST Endpoint to valid a request, url: "http://localhost:8000/message-signature/validate"
     */

    postMessageSignatureValidate() {
        this.app.post("/message-signature/validate", 
        [
            check('address').not().isEmpty().withMessage('address is required!'),
            check('signature').not().isEmpty().withMessage('messageSignature is required!')
        ], (req, res) => {

            const errors = validationResult(req);
        
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            this.RequestPoolClass.validateRequestByWallet(JSON.stringify(req.body).toString())
                .then((result) => { return res.json( JSON.parse(result) ) })
                .catch((err)   => { return res.json( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });
            
        });
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}