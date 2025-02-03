
const {loginUser,registerUser,getLogInUser, verify_token}=require("../controller/auth.controller");
module.exports=(app)=>{
app.get("/api/auth/getLogInUser",verify_token(),getLogInUser);
app.post("/api/auth/register",registerUser);
app.post("/api/auth/login",loginUser);
}



