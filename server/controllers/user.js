import express from "express"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import User  from "../models/User.js"


//EDIT USER CREDENTIALS
export const updateUser = async (req,res) => {
    if(req.header.id === req.params.id){
        if(req.body.password){
            req.body.password = await bcrypt.hash(password, 12)
        }
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, {$set: req.body}, {new:true})
            res.status(200).json(updatedUser)
        } catch (error) { 
            res.status(500).json(error) 
        }
    }else{
        res.status(403).json("You can only update your account")
    }
}

//DELETE USER
export const deleteUser = async (req,res) => {
    if(req.header.id === req.params.id){
        try {
            const user = User.findById(req.params.id)
            try {
                await User.findByIdAndDelete(req.params.id)
                res.status(200).json("User has been deleted successfully")
            } catch (error) {
                res.status(500).json(error)
            }
        } catch (error) {
            res.status(404).json("User not found")
        }
    } else{
        res.status(401).json("You can only delete your account")
    }
}

//GET USER
export const getUser = async (req,res) => {
    try {
        const user = await User.findById(req.params.id)
        const {password, updatedAt, ...others } = user._doc
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json(error)
    }
}

//GET USER BY ID
export const getUserById = async (req,res) => {
    const currentUserId = req.header.id
    const findUserId = req.params.id
    try {
        const currentUser = await User.findOne({_id:findUserId}, {username:1, followers:1, profilePic:1, following: 1, postsCreated:1,createdAt:1})
        //console.log(currentUser)
        res.status(200).json(currentUser)
    } catch (error) {
        res.status(500).json(error)
    }
} 

//FOLLOW USER
export const followUser = async (req,res) => {
    if(req.header.id !== req.params.id){
        try {
            const user = await User.findById(req.params.id)
            const currentUser = await User.findById(req.header.id)
            if(!user.followers.includes(req.header.id)){
                await user.updateOne({ $push: {followers: req.header.id}})
                await currentUser.updateOne({ $push: {following: req.params.id}})
                res.send("Followed the user sucessfully")
            } else {
                await user.updateOne({ $pull : {followers: req.header.id}})
                await currentUser.updateOne({$pull: {following: req.params.id}})
                res.send("Unfollowed the user successfully")
            }
        } catch (error) {
            res.status(500).json(error)
        }

    }else {
        res.status(403).json("you cannot follow your own account")
    }
}

//UNFOLLOW USER
// export const unfollowUser = async (req,res) => {
//     if(req.params.id !== req.header.id){
//         try {
//             const user = await User.findById(req.params.id)
//             const currentUser = await User.findById(req.header.id)
//             if(user.followers.includes(req.header.id)){
//                 await user.updateOne({ $pull : {followers: req.header.id}})
//                 await currentUser.updateOne({$pull: {following: req.params.id}})
//                 res.send("Unfollowed the user successfully")
//             }
//             else{
//                 req.status(403).json("You already unfollow this account")
//             }
//         } catch (error) {
//             res.status(500).json(error)
//         }
//     } else{
//         res.status(403).json("You cannot unfollow your own account")
//     }
// }

 