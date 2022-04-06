import mongoose from "mongoose"


const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required: true
    },
    thumbnail:{
        type:String,
        required:false 
    },
    url:{
        type:String,
        required:false
    },
    upvotes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    categories:{
        type:[String]
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment' 
    }],
    privateForum:{
        type: Boolean,
        default:false
    },
    privateForumCommenters:{
        type:Array,
        default:[]
    },
    commentCount:{
        type:Number,
        default:0,
    },
    tags:{
        type:Array,
        default:[]
    },
    creator:{type: String, ref: 'User', required: true}
} , {timestamps:true})

var Post = mongoose.model("Post", postSchema)
export default Post