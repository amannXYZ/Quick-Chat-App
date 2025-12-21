const router = require('express').Router();
const User = require('./../models/user');
const authMiddleware = require('../middlewares/authMiddleware')
const cloudinary = require('./../cloudinary');
const user = require('./../models/user');

//getting details of currently loggedin users
router.get('/get-logged-user',authMiddleware ,  async(req ,res) =>{
    try{
        const userId = req.userId;
        const user = await User.findById(userId);

        res.send({
            message : 'User fetched successfully',
            success : true,
            data : user
        });
    }
    catch(error){
        res.status(400).send({
            message : error.message,
            success : false
        })
    }
    
});

//getting the details of all the users except the currently logged in users
router.get('/get-all-users',authMiddleware ,  async(req ,res) =>{
    try{
        const userId = req.userId;
        const users = await User.find({_id:{$ne:userId}});

        res.send({
            message : 'All users fetched successfully',
            success : true,
            data : users
        });
    }
    catch(error){
        res.status(400).send({
            message : error.message,
            success : false
        })
    }
    
})

router.post('/upload-profile-pic', authMiddleware, async (req, res) => {
    try{
        const image = req.body.image;

        //UPLOAD THE IMAGE TO CLODINARY
        const uploadedImage = await cloudinary.uploader.upload(image, {
            folder: 'quickchat'
        });

        //UPDATE THE USER MODEL & SET THE PROFILE PIC PROPERTY
        const user = await User.findByIdAndUpdate(
            req.userId,
            { profilePic: uploadedImage.secure_url},
            { new: true}
        );

        res.send({
            message: 'Profic picture uploaded successfully',
            success: true,
            data: user
        })
    }catch(error){
        res.send({
            message: error.message,
            success: false
        })
    }
})


module.exports = router;
