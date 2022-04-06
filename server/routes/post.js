import express from "express"
import { getPosts, getPostsBySearch, createPosts, updatePosts, deletePost, getPostById, downvotePost, upvotePost, savePost, commentPost, replyComment, createPrivateForum, deletePrivateForum, privateCommentPost, replyPrivateCommentPost, deleteComment, editComment, getCreatedPosts, getSavedPosts, getUpvotedPosts} from "../controllers/post.js"
import { verifyToken } from "../middleware/verifyToken.js"

const router = express.Router()

router.get('/', getPosts)
router.get('/search', getPostsBySearch)

router.get('/myposts', verifyToken, getCreatedPosts)
router.get('/savedposts', verifyToken, getSavedPosts) 
router.get('/upvotedposts', verifyToken, getUpvotedPosts) 


router.post('/create',verifyToken, createPosts)
router.get('/:id', getPostById) //Keep this get request below every other get requests as in url mapping i.e api/post/:id ":id" is considered as a variable and it is being called after every api/post, so in api/post/myposts, "/myposts" is being considered as an ID

router.put("/:id/update",verifyToken, updatePosts)
router.delete("/:id/delete",verifyToken, deletePost)  
 
router.put('/:id/downvote',verifyToken, downvotePost)
router.put('/:id/upvote',verifyToken, upvotePost)
router.put("/:id/save",verifyToken, savePost)

router.post("/:id/comment",verifyToken, commentPost)
router.post("/:id/:commentid/reply",verifyToken, replyComment) 

router.put("/:id/privateForum",verifyToken, createPrivateForum)
router.put("/:id/deletePrivateForum",verifyToken, deletePrivateForum)
router.post("/:id/privateComment",verifyToken, privateCommentPost)
router.post("/:id/commentid",verifyToken, replyPrivateCommentPost)

router.put("/:id/commentid/edit",verifyToken, editComment) 
router.delete("/:id/commentid/delete",verifyToken, deleteComment)

export default router 