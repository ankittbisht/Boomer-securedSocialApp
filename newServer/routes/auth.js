import express from "express" ;
import  {login,getUser,handleAllUsersSessionsActivity}  from "../controllers/auth.js";

const router  = express.Router();

router.post("/login" , login)
router.get("/getUser", getUser)
router.get("/handleAllUsersSessionsActivity", handleAllUsersSessionsActivity)
export default router;