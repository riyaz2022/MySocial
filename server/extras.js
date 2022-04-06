router.put('/:id/unupvote',verifyToken, unUpvotePost)
router.put('/:id/undownvote',verifyToken, unDownvotePost)
router.put("/:id/unsave",verifyToken, unsavePost)

//UNSAVE POST

export const unsavePost = async (req, res) => {
    try {
        const post = Post.findById(req.params.id)
        const user = User.findById(req.header.id)
        if(user.savedPosts.includes(req.params.id)){
            await user.updateOne({ $pull: {savedPosts: req.params.id}})
            res.status(200).json("Post unsaved successfully")
        } else{
            res.json("This post is not saved")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


//UNUPVOTE POST

export const unUpvotePost = async (req,res) => {
    try {
        const post = Post.findById(req.params.id)
        const user = User.findById(req.header.id)
        if(post.upvotes.includes(req.header.id)){
            await post.updateOne({ $pull: {upvotes: req.header.id}})
            await user.updateOne({ $pull: {upvotedPosts: req.params.id}})
            res.status(200).json("The post has been unupvoted")
        } else {
            res.json("You cannot unupvote this post")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}

//UNDOWNVOTE POST

export const unDownvotePost = async (req,res) => {
    try {
        const post = Post.findById(req.params.id)
        const user = User.findById(req.header.id)
        if(post.downvotes.includes(req.header.id)){
            await post.updateOne({ $pull: {downvotes: req.header.id}})
            await user.updateOne({ $pull: {downvotedPosts: req.params.id}})
            res.status(200).json("This post has been undownvoted")
        } else{
            res.json("You cannot undownvote this post")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}