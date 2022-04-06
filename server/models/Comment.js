import mongoose from "mongoose"


const commentSchema = new mongoose.Schema({ 
    writer:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Post'
    },
    parentId: { type: mongoose.Types.ObjectId, ref: "Comment", default: null },
    upvotes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
    downvotes: [{ type: mongoose.Types.ObjectId, required: true, ref: "User" }],
    content:{
        type:String,
        required:true
    }
}, { timestamps: true})

var Comment = mongoose.model("Comment", commentSchema)
export default Comment