import express from "express"
import {  deleteUser, followUser, getUser, getUserById, updateUser } from "../controllers/user.js"
import {  signup, signin, forgotPassword, resetPassword } from "../controllers/auth.js"
import { verifyToken } from "../middleware/verifyToken.js"
import { getFollowers, getFollowing } from "../controllers/post.js"
const router = express.Router()

router.post("/signup", signup)
router.post("/signin", signin)
router.put("/forgot-password", forgotPassword)  
router.put("/reset-password", resetPassword)

router.get('/followers', verifyToken, getFollowers)
router.get('/following', verifyToken, getFollowing)

router.get("/:id/user", verifyToken, getUser)
router.get("/user/:id", verifyToken, getUserById) 

router.put("/:id/update",verifyToken, updateUser)
router.delete("/:id/delete",verifyToken, deleteUser)  
 
router.put("/:id/follow",verifyToken, followUser)




export default router