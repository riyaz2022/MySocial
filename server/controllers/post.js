import express from "express"
import mongoose from "mongoose"
import Post from "../models/Post.js"
import User from "../models/User.js"
import Comment from "../models/Comment.js"


//GET ALL POSTS
export const getPosts = async (req,res) => {
    try {
        const post = await Post.find()
        res.status(200).json(post)
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

//GET POSTS BY USER
export const getCreatedPosts = async (req,res) => {
    const userId = req.header.id
    try {
        const result = await Post.find({ creator: userId})
        res.status(200).json(result)
    } catch (error) {  
        res.status(404).json({ message: error.message}) 
    } 
}


//GET POSTS BY SEARCH

export const getPostsBySearch = async (req,res) => {
    const { searchQuery } = req.query
    try {
        const title = new RegExp(searchQuery, 'i')
        const posts = await Post.find({ title }) 
        res.json({ data: posts})
    } catch (error) {
        res.status(404).json({ message: error.message})
    }
}

//GET POST BY ID
export const getPostById = async (req,res) => {
    const id = req.params.id
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json("Invalid Id")
    try {
        const post = await Post.findById(id).populate({
            path: 'comments',
            model: 'Comment',
            populate: { 
                path: 'writer',
                model: 'User', 
                select: 'username'
            }
        })
        console.log(post)       
        const user = await User.findById(post.creator)
        const name = user.username 
        // console.log(name)
        res.status(200).json({post, name}) 
    } catch (error) {
        res.status(500).json(error)
    }
}


//CREATE POST
export const createPosts = async (req,res) => {
    const post = req.body 
    const userId = req.header.id
    const newPost = new Post({ ...post, creator:userId, createdAt: new Date().toISOString() })
    try {
        const user = await User.findById(req.header.id)
        await newPost.save()
        await user.updateOne({$push:{postsCreated: newPost.id}})
        res.status(201).json(newPost)
    } catch (error) {
        res.status(409).json({message : error.message})
    }
}

//UPDATE POST
export const updatePosts = async (req,res) => {
    const id = req.params.id
    const post = req.body
    const userId = req.header.id

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Invalid ID for updation")
    try {
        
        const updatedPost = await Post.findOneAndUpdate({_id: id, creator:userId}, post ,{new:true})
        res.json(updatedPost)
    } catch (error) {
        res.status(409).json({message: error.message})
    }
}

//DELETE POST
export const deletePost = async (req,res) => {
    const id = req.params.id
    const userId = req.header.id

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Invalid ID for deletion")
    const post = await Post.findById(id)
    // console.log(post.creator)
    // console.log(userId)
    if(userId === post.creator){
    try {
        const user = await User.findById(req.header.id)
        await user.updateOne({$pull: {postsCreated: id}})
        await Post.findByIdAndDelete(id)
        //clearing posts document from users database
        res.json({message: "Post deleted successfully"})
    } catch (error) {
        res.status(409).json({ message: error.message})
    }
  } else{
      res.status(500).json("This user cannot delete the post")
  }
}

//UPVOTE POST / UNUPVOTE

export const upvotePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id)
        // console.log(post.title)
        const user = await User.findById(req.header.id)
        // console.log(user)
        if(!post.downvotes.includes(req.header.id)){ 
            if(!post.upvotes.includes(req.header.id)){
                await post.updateOne({ $push: {upvotes: req.header.id}})
                await user.updateOne({ $push: {upvotedPosts: req.params.id}})
                res.status(200).json("The post has been upvoted")
            } else {
                await post.updateOne({ $pull: {upvotes: req.header.id}})
                await user.updateOne({ $pull: {upvotedPosts: req.params.id}})
                res.status(200).json("The post has been unupvoted")
                //res.json("This post has already been upvotes by you")
            }
        } else {
            res.json("You cannot both upvote and downvote the same post")
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
}

//GET UPVOTED POSTS

export const getUpvotedPosts = async (req,res) => {
    const userId = req.header.id
    try {
        const upvotedPosts = await User.findOne({ _id: userId}, { upvotedPosts: 1, _id:0});
        const result = await Post.find({_id: { $in: upvotedPosts.upvotedPosts }})
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({error: error.message}) 
    }
}

//DOWNVOTE POST /UNDOWNVOTE POST

export const downvotePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.header.id)
        if(!post.upvotes.includes(req.header.id)){
            if(!post.downvotes.includes(req.header.id)){
                await post.updateOne({$push: {downvotes:req.header.id}})
                await user.updateOne({ $push: {downvotedPosts: req.params.id}})
                res.status(200).json("This post has been downvoted")
            } else{
                await post.updateOne({ $pull: {downvotes: req.header.id}})
                await user.updateOne({ $pull: {downvotedPosts: req.params.id}})
                res.status(200).json("This post has been undownvoted")
            //res.json("This post has already been downvoted by you")
            }
        } else{
            res.json("You cannot both upvote and downvote the same post")
        }
       
    } catch (error) {
        res.status(500).json(error)
    }
}


//SAVE POST

export const savePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const user = await User.findById(req.header.id)
        if(!user.savedPosts.includes(req.params.id)){
            await user.updateOne({ $push: {savedPosts: req.params.id}})
            res.status(200).json("Post saved successfully")
        } else{
            await user.updateOne({ $pull: {savedPosts: req.params.id}})
            res.status(200).json("Post unsaved successfully")
            //res.json("This post is already saved")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

//GET SAVED POST

export const getSavedPosts = async (req,res) => {
    const userId = req.header.id
    try {
        const savedPosts = await User.findOne({ _id: userId}, { savedPosts: 1, _id:0});
        //console.log(savedPosts.savedPosts)
        //let saved = savedPosts.savedPosts.map((save) => mongoose.Types.ObjectId(save)) //We cannot directly iterate over savedPosts as it was an object which contained savedPosts array
        //console.log(saved)
        const result = await Post.find({_id: { $in: savedPosts.savedPosts }}) //first savedPosts is an object called savedPosts which contains a single array called savedPosts
        //console.log(result)
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({error: error.message}) 
    }
}

//GET FOLLOWERS

export const getFollowers = async (req,res) => {
    const userId = req.header.id
    try {
        const followersArray = await User.findOne({_id: userId}, {followers: 1, _id: 0})
        const followers = await User.find({ _id: {$in: followersArray.followers}})
        res.status(200).json(followers)
    } catch (error) {
        res.status(500).json({error: error.message}) 
    }
}

//GET FOLLOWING

export const getFollowing = async (req,res) => {
    const userId = req.header.id
    try {
        const followingArray = await User.findOne({_id: userId}, {following: 1, _id: 0})
        const following = await User.find({ _id: {$in: followingArray.following}})
        res.status(200).json(following)
    } catch (error) {
        res.status(500).json({error: error.message}) 
    }
}

//COMMENT POST
export const commentPost = async (req,res) => {
    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.header.id)
    const comment = req.body
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to comment")
    const newComment = new Comment({...comment,responseTo: req.params.id,writer: req.header.id, postId: req.params.id,createdAt: new Date().toISOString()})
    try {
        await newComment.save()
        //console.log(newComment.id)
        await post.updateOne({$push: {comments: newComment.id}})
        //await post.updateOne({$push: {commentCount: commentCount + 1}})
        await user.updateOne({$push: {commentedPosts: req.params.id}})
        res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json(error)
    }
}


//DELETE COMMENT
export const deleteComment = async (req,res) => {
    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.header.id)
    const commentId = req.params.commentid
    const comment = await Comment.findById(commentId)
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to delete comment")
    if(req.header.id === comment.writer) {
        try {
            await Comment.findByIdAndDelete(commentId)
            res.json({message: "Post deleted successfully"})
            //We are not pulling the commentedPosts from users model as we still want to display the user who commented but not its content
        }catch (error) {
            res.status(409).json({ message: error.message})
        }
    } else {
        req.json("You can only delete your own comment")
    }
}

//EDIT COMMENT

export const editComment = async (req,res) => {
    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.header.id)
    const editedPost = req.body
    const commentId = req.params.commentid
    const comment = await Comment.findById(commentId)
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to edit comment")
    if(req.header.id === comment.writer) {
        try {
            const updatedComment = await Comment.findByIdAndUpdate({_id:commentId, writer: req.header.id}, editedPost, {new:true})
        } catch (error) {
            res.status(409).json({ message: error.message})
        }
    } else {
        req.json("You can only edit your own comment")
    }
}

//REPLY TO COMMENT

export const replyComment = async (req,res) => {
    const postId = req.params.id
    const post = await Post.findById(postId)
    const commentId = req.params.commentid
    const user = await User.findById(req.header.id)
    const comment = req.body
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to comment")
    const newReply = new Comment({...comment,responseTo: commentId, writer: req.header.id, postId: postId,createdAt: new Date().toISOString()})
    try {
        await newReply.save()
        await post.updateOne({$push: {comments: newReply.id}})
        //await post.updateOne({$push: {commentCount: commentCount + 1}})
        await user.updateOne({$push: {commentedPosts: postId}})
        res.status(201).json(newReply)
        res.status(200).json("Reply posted successfully")
    } catch (error) {
        res.status(500).json(error)
    }
}


//CREATE PRIVATE COMMENT DISCUSSION FORUM
export const createPrivateForum = async (req,res) => {
    const id = req.params.id
    const userId = req.header.id
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Invalid post ID ")
    
    const post = await Post.findById(id)
    const postCreatorId = post.creator

    if(userId !== postCreatorId) {
        res.status(401).json("You cannot create private room as only post creator is allowed to do so")
    } else {
        const {users}  = req.body;
        // console.log(users)
        try {
            const updatedPost = await Post.findByIdAndUpdate(id, {$set: {privateForum: true , privateForumCommenters: users}}, {new:true})
            console.log(updatedPost)
            res.status(200).json(updatedPost)
        } catch (error) {
            res.status(500).json(error)
            console.log(error)
        }
    }
}

//DELETE PRIVATE COMMENT DISCUSSION FORUM
export const deletePrivateForum = async (req,res) => {
    const id = req.params.id
    const userId = req.header.id
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("Invalid post ID ")
    
    const post = await Post.findById(id)
    const postCreatorId = post.creator

    if(userId !== postCreatorId) {
        res.status(401).json("You cannot delete this private room as only post creator is allowed to do so")
    } else {
        const {users}  = req.body;
        // console.log(users)
        try {
            const updatedPost = await Post.findByIdAndUpdate(id, {$set: {privateForum: false , privateForumCommenters: null}}, {new:true})
            console.log(updatedPost)
            res.status(200).json(updatedPost)
        } catch (error) {
            res.status(500).json(error)
            console.log(error)
        }
    }
}

//COMMENT ON PRIVATE COMMENT DISCUSSION FORUM

export const privateCommentPost = async (req,res) => {
    const post = await Post.findById(req.params.id)
    const user = await User.findById(req.header.id)
    const comment = req.body
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to comment")
    console.log(post)
    const newComment = new Comment({...comment,responseTo: req.params.id,writer: req.header.id, postId: req.params.id,createdAt: new Date().toISOString()})
    // console.log(post.privateForumCommenters)
    // console.log(post.id)
    
    if(post.privateForum === true && post.privateForumCommenters.includes(req.header.id)){
        try {
            await newComment.save()
            console.log(newComment.id)
            await post.updateOne({$push: {comments: newComment.id}})
            //await post.updateOne({$push: {commentCount: commentCount + 1}})
            await user.updateOne({$push: {commentedPosts: req.params.id}})
            res.status(201).json(newComment)
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("you do not have access to comment in private rooms")
    }
   
}


//REPLY TO COMMENT IN PRIVATE COMMENT DISCUSSION FORUM

export const replyPrivateCommentPost = async (req,res) => {
    const postId = req.params.id
    const post = Post.findById(postId)
    const commentId = req.params.commentid
    const user = User.findById(req.header.id)
    const comment = req.body
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).send("Invalid ID to comment")
    const newReply = new Comment({...comment,responseTo: commentId, writer: req.header.id, postId: postId,createdAt: new Date().toISOString()})
    if(post.privateForum === true && post.privateForumCommenters.includes(req.header.id)){
        try {
            await newReply.save()
            await post.updateOne({$push: {comments: newReply.id}})
            //await post.updateOne({$push: {commentCount: commentCount + 1}})
            await user.updateOne({$push: {commentedPosts: postId}})
            res.status(201).json(newReply)
            res.status(200).json("Reply posted successfully")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("you do not have access to comment in private rooms")
    }
    
}