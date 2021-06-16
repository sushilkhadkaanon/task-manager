
const express = require('express')
const User = require('../models/user')
const auth = require('../middlewares/auth')
const Task = require('../models/task')
const multer = require('multer')
const sharp = require('sharp')
const {welcomeEmail, cancelEmail} = require('../emails/accounts')

const userRouter =  express.Router()

userRouter.post('/user',async (req,res)=>{

    const user = new User(req.body)
    try{
        const token = await user.generateAuthToken()

        await user.save()
        welcomeEmail(user.email, user.name)
        res.status(201).send({user, token})
        


    }catch(e){

        res.status(400).send(e)

    }
    

})


userRouter.post('/users/login', async (req,res)=>{
    
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()
        res.send({user, token})
        
        
    }catch(e){
        res.status(400).send(e)
       
    }
    
})




userRouter.get('/users/me', auth , async (req,res)=>{

   res.send(req.user)

})





userRouter.patch('/users/me',auth, async (req, res)=>{

    const allowedUpdates = ["name","age","email","password"]
    const requestedUpdates = Object.keys(req.body)

    const isValidUpdates = requestedUpdates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isValidUpdates){
        return res.status(400).send({
            "Error":"Invalid Update!"
        })
    }

    try{

        // const user = await User.findById(req.params.id)

        const user = await req.user
        requestedUpdates.forEach((update)=>{
            return user[update] = req.body[update]
        })
        await user.save()


        //const user = await User.findByIdAndUpdate(req.params.id,req.body,{new: true, runValidators:true})
    
        res.send(user)
    }catch(e){
        res.status(400).send()
    }
})



userRouter.delete('/users/me', auth, async (req, res)=>{

    try{

        txcancelEmail(req.user.email, req.user.name)
        await req.user.remove()
        await Task.deleteMany({owner:req.user._id})
        
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})



userRouter.post('/users/logout', auth , async(req,res)=>{

    try{

        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send('Logged Out!')
    

    }catch(e){

        res.status(500).send()

    }
    

})


userRouter.post('/users/logoutAll', auth , async(req,res)=>{

    try{

        req.user.tokens = []
        await req.user.save()
        res.send('Logged Out from all sessions!')
    

    }catch(e){

        res.status(500).send()

    }
    

})

const upload = multer({
    limits:{
        fileSize: 1000000,
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)){

            return cb(new Error('Please upload an image file'))

        }

        cb(undefined, true)
    }
})


userRouter.post('/users/me/avatar',auth, upload.single('avatar'), async (req, res)=>{

    const buffer = await sharp(req.file.buffer).resize({height:250, width:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error:error.message})
})


userRouter.delete('/users/me/avatar',auth, async ( req, res)=>{
    req.user.avatar = undefined;
    await req.user.save();
    res.send()

})


userRouter.get('/users/:id/avatar', async (req, res)=>{

    try{

        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image')
        res.send(user.avatar)

    }catch(e){
        res.status(404).send()
    }
})











module.exports = userRouter
