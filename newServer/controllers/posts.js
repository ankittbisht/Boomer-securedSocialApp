import Post from "../models/Post.js"
import { User, UserSession } from "../models/User.js";
import { dataToInsert } from "../database.js";

// CREATE 
export const createPost = async (req, res) => {
    try {
        const { userId, description, picturePath } = req.body;
        const user = await User.findById(userId);
        //creating new post(document)
        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            userPicturePath: user.picturePath,
            picturePath,
            likes: {},
            comments: [],
        });
        const username = user.firstName;
        const existingSession = await UserSession.findOne({ username });
        // console.log("this is console for sessions " + res.cookie);
        let UserSessionForUser;
        if (existingSession) {
            UserSessionForUser = existingSession;
            UserSessionForUser.numberOfTimesLoggedIn = UserSessionForUser.numberOfTimesLoggedIn ? Number(UserSessionForUser.numberOfTimesLoggedIn) + 1 : 1;
        } else {
            UserSessionForUser = new UserSession({ firstName: user.firstName }); // Create new session if none exists
        }
        UserSessionForUser.lastLogin = new Date();
        UserSessionForUser.activity = "CreatePost";
        await UserSessionForUser.save();
        dataToInsert(UserSessionForUser);
        await newPost.save();
        //finding all the post from database(Post)
        const post = await Post.find();
        res.status(201).json(post);

    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}


// READ 
export const getFeedPosts = async (req, res) => {
    try {
        const post = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const post = await Post.find({ userId });
        res.status(200).json(post);
    } catch (error) {
        res.status(403).json({ message: error.message });
    }
};

// UPDATE 
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const post = await Post.findById(id);

        const isLiked = post.likes.get(userId);
        if (isLiked) { //if the user already liked the post then remove the like
            post.likes.delete(userId);
        } else {
            post.likes.set(userId, true);
        }

        //update the post likes and return it to frontend

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { likes: post.likes },
            { new: true }
        );
        const username = req.user.firstName;
        const existingSession = await UserSession.findOne({ username });
        // console.log("this is console for sessions " + res.cookie);
        let UserSessionForUser;
        if (existingSession) {
            UserSessionForUser = existingSession;
            UserSessionForUser.numberOfTimesLoggedIn = UserSessionForUser.numberOfTimesLoggedIn ? Number(UserSessionForUser.numberOfTimesLoggedIn) + 1 : 1;
        } else {
            UserSessionForUser = new UserSession({ firstName: user.firstName }); // Create new session if none exists
        }
        UserSessionForUser.lastLogin = new Date();
        if (isLiked) {
            UserSessionForUser.activity = "UnlikedPost";
        } else {
            UserSessionForUser.activity = "LikedPost";
        }
        await UserSessionForUser.save();
        dataToInsert(UserSessionForUser);
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(407).json({ message: error.message });
    }
};