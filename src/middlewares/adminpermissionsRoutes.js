const adminpermissionsRoutes = (req, res, next) => {
 
    if (req.session.user == undefined || req.session.user.role === "User"|| req.session.user.role === "Premium") {
        return res.redirect('/products');
    }

    next()
}
export default adminpermissionsRoutes

