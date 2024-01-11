module.exports = (req,res,next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    next();
}