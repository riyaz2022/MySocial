import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

export const verifyToken = (req,res,next) => {
    const token = req.headers.authorization.split(" ")[1]
    if(!token){
        return res.status(403).send("A token is required for authentication")
    }
    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY)
        req.header.email = decoded.email
        req.header.id = decoded.id
    } catch (error) {
        res.status(401).send("Invalid token")
    }
    return next();
}