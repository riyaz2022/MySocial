import express from "express"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import User  from "../models/User.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import nodemailer from "nodemailer"
import _ from "lodash"


dotenv.config() 
//SIGNUP API
export const signup = async (req,res) => {
    const { username, email, profilePic, password, confirmPassword } = req.body;

    try {
        const existingUser = await User.findOne({ email })
        if(existingUser) return res.status(400).json({ message: "User already exists"})

        const existingUsername = await User.findOne({ username })
        if(existingUsername) return res.status(400).json({ message: "Username already taken"})

        if(password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match"})

        //const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({username, email, password, profilePic})
        // const token = jwt.sign({ email:result.email, id:result._id}, 'test', { expiresIn: '1hr'})
        // user.token = token

        res.status(200).json({user})
    } catch (error) {
        res.status(500).json({message: "Something went wrong"})
    }
}

//SIGNIN API
export const signin = async (req,res) => {
    const { email, password} = req.body;
    if(!email || !password) {
        return res.json("Input error")
    }
    try {
        const existingUser = await User.findOne({ email })
        if(!existingUser) return res.status(404).json({message: "User does not exists"})

        // const hashedPassword = await bcrypt.hash(password, 12)

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid Credentials"})

        const token = jwt.sign({email: existingUser.email, id:existingUser._id}, process.env.SECRET_KEY, { expiresIn: "5hr"})

        res.status(200).json({user:existingUser, token})
    } catch (error) { 
        res.status(500).json({ message:"Something went wrong"})
    }
}


//FORGOT PASSWORD

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });


export const forgotPassword = async (req,res) => { 
    const { email } = req.body
    User.findOne({email}, (err, user) => {
        if(err || !user) {
            return res.status(400).json({error: "User with this email does not exist"})
        }

        const token  = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: '20m'})
        const mailOptions = {
            from:'noreply@gmail.com',
            to: email,
            subject: 'Password reset link',
            html:`
                <h2>Please click on the given link to reset your password</h2>
                <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>
            `
        }
        return user.updateOne({ resetLink: token}, (err, success) => {
            if(err){
                return res.json(400).json({ error: "reset password link error"})
            } else {
                transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                      console.log("Error " + err);
                    } else {
                      console.log("Email sent successfully");
                    }
                  });
            }
        })
    })
}

//RESET PASSWORD

export const resetPassword = async (req,res) => {
    const {resetLink, newPass} = req.body
    const newPassword = await bcrypt.hash(newPass, 12)
    if(resetLink){
        jwt.verify(resetLink, process.env.RESET_PASSWORD_KEY, function(err,decodedData) {
            if(err){
                return res.status(401).json({
                    error: "Incorrect token or it is expired"
                })
            }
            User.findOne({resetLink}, (err,user) => {
                if(err || !user){
                    return res.status(400).json({ err: "User with this token does not exist"})
                }
                const obj = {
                    password: newPassword
                }

                user = _.extend(user, obj)
                user.save((err, result) => {
                    if(err){
                        return res.status(400).json({err: "reset password error"})
                    } else {
                        return res.status(200).json({message: "Your password has been changed"})
                    }
                })
            })
        })
    } else {
        return res.status(401).json({error: "Authentication error"})
    }
}