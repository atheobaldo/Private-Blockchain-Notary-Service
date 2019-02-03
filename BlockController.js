const SHA256           = require('crypto-js/sha256');
const BlockClass       = require('./Block.js');
const BlockChain       = require('./BlockChain.js');
const MemPoolClass     = require('./Mempool.js');

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
        this.myBlockChain  = new BlockChain.Blockchain();
        this.memPoolClass  = new MemPoolClass.Mempool();
        this.app           = app;
        this.postRequestValidation();
        this.postMessageSignatureValidate();
        this.postNewBlock();
        this.getBlockByIndex();
        this.getBlockByHash();
        this.getBlockByWallet();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
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
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
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

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            const newBlock = new BlockClass.Block(body);

           this.myBlockChain.addBlock(newBlock)
                .then((result) => { res.send( JSON.parse(result)); })
                .catch((err)   => { res.send( JSON.parse( JSON.stringify({ 'error' : err.message }).toString() )) });

        });
    }


    postRequestValidation() {
        this.app.post("/requestValidation", 
        [
            check('address').not().isEmpty().withMessage('Address is required!')
        ], (req, res) => {

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }

            this.memPoolClass.addRequestValidation(req.body.address)
                .then((result) => { return res.json( JSON.parse(result) ) })
                .catch((err)   => { return res.json( {'error' : err.message} ) });

        });    
    }


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

            this.memPoolClass.validateRequestByWallet(JSON.stringify(req.body).toString())
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