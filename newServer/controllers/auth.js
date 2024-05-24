import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, UserSession } from "../models/User.js";
import { dataToInsert,dataToFetch } from "../database.js";

const getSessionId = async (userId) => {
    const userSession = await UserSession.findOne({ userId: userId });
    return userSession ? userSession.id : null;
};
//  REGISTER USER
export const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            picturePath,
            friends,
            location,
            occupation
        } = req.body;

        const salt = await bcrypt.genSalt();
        const passwordhash = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordhash,
            picturePath,
            friends,
            location,
            occupation,
            viewedProfile: Math.floor(Math.random() * 10000),
            impressions: Math.floor(Math.random() * 10000)
        });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// logging in
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email })//2 email denotes login email
        if (!user) return res.status(400).json({ msg: "User does not exist. " });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
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
        UserSessionForUser.activity = "Login";
        await UserSessionForUser.save();
        dataToInsert(UserSessionForUser);
        delete user.password;
        res.status(200).json({ token, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getUser = async (req, res) => {
    const user = await User.find({});
    if (!user) res.send("wrong email address");
    // console.log("session id of request " + JSON.stringify(req.sessionID));
    const UserSessionForUser = await UserSession.find({});
    res.send("details of all user are" + user + "details of sessions are" + UserSessionForUser);
    console.log("success");
}


export const handleAllUsersSessionsActivity = async (req, res) => {
    try {
        dataToFetch((err, data) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Internal Server Error' });
                return;
            }
            res.json(data); // Assuming data is an array of objects
        });
    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
