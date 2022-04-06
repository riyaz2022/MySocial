import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true
    },
    profilePic:{
        type: String,
    },
    email: {
        type:String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    about:{
        type:String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    followers:[{ type: mongoose.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    postsCreated:{
        type:Array,
        default:[]
    },
    upvotedPosts:{
        type:Array,
        default:[]
    }, 
    downvotedPosts:{
        type: Array,
        default:[]
    },
    savedPosts:{
        type:Array,
        default:[]
    },
    commentedPosts:{
        type:Array,
        default:[]
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    resetLink:{
        data:String,
        default:''
    }
}, {timestamps: true})

var User = mongoose.model("User", userSchema)
export default User