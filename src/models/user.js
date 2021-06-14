const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt= require('bcryptjs')
const jwt = require('jsonwebtoken')

const Task = require('./task')


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        unique:true,
        required:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email.')
            }
        },
        
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
           if(value.toLowerCase().includes('password')){
                throw new Error('Password must be not "password"')
            }
        }
    },

    age:{
        type:Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('Age must be a non negative number.')
            }
        }
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer,
    }
},{
    timestamps:true
})




userSchema.virtual('tasks',{
    ref:Task,
    localField:'_id',
    foreignField:'owner'
})




userSchema.pre('save', async function(next){

    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})


userSchema.methods.toJSON = function (){

    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
   delete userObject.avatar
    return userObject

}


userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token  = jwt.sign({_id:user._id.toString()}, 'taskmanagerapp')

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw Error('Invalid login..')
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error('Invalid login..')
    }

    return user
}




const User = mongoose.model('User',userSchema)





module.exports = User