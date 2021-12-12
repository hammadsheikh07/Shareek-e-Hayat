module.exports ={
    ensuteAuthenticated :  (req, res , next) =>{
        if(req.isAuthenticated()){
            return next();
        }
        else
       res.send("please login");
    }
}
