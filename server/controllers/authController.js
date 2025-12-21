const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user');
const message = require('../models/message');

//sign up route
router.post('/signup' , async(req ,res)=>{
    try{
        //if user already exist
        const user = await User.findOne({email : req.body.email});
        // if user already exist
        if(user){
                return res.send({
                message : 'User already exist',
                success : false
            })
        }
        
        //encrypt the password
        const hashedPassword = await bcrypt.hash(req.body.password , 10);  
        req.body.password = hashedPassword;

        //create new user
        const newUser = new User(req.body);
        await newUser.save();

        res.send({
            message : 'User created successfully',
            success : true
        });
    }catch(error){
        res.send({
            message: error.message || 'Internal server error',
            success: false
        });
    }
})

// login route
router.post('/login', async (req, res) => {  
    try{
        const {email , password} = req.body;
        if(!email || !password){
            return res.send({
                message : 'Email and password are required',
                success : false
            });
            
        }
        //chck if user exist
        const user  = await User.findOne({
            email : email
        })
        if(!user){
            return res.send({
                message : 'User does not exist',
                success : false
            })
        }
        

        //compare password
        const isValid = await bcrypt.compare(password , user.password);
        if(!isValid){
            return res.send({
                message : ' Invalid password',
                success : false
            })

        }
        //generate jwt token
        const token  = jwt.sign({userId : user._id.toString()}, process.env.SECRET_KEY , {expiresIn : '1d'});
        res.send({
            message : 'Login successfully',
            success : true,
            token : token
        })
    } catch (err) {
        
        res.send({
            message: err.message || 'Internal server error',
            success: false
        });
    }
});


module.exports = router;