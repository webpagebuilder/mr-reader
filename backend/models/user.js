const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto=require('crypto')


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a valid name'],
        maxlength:[30,'Your name cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail,'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your Password must be longer then 6 characters '],
        select:false
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default:'user'
    },
    createdAt: {
        type: Date,
        default:Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire:Date
    

})

//Encrypt Password before aving user
userSchema.pre('save', async function (next)
{
    if (!this.isModified('password'))
    {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

//Compare two passwords 
userSchema.methods.comparePassword =async function (enteredPassword)
{
    return await bcrypt.compare(enteredPassword, this.password)
}

//Return Jwt token
userSchema.methods.getJwtToken = function ()
{
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}
//Generate pasword reset token
userSchema.methods.getResetPasswordToken = function ()
{
    //Generate token 
    const resetToken = crypto.randomBytes(20).toString('hex')
    
    //Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    //Set Token expires time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    
    return resetToken
}

module.exports =mongoose.model('User',userSchema)