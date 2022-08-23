const expressJwt =     require('express-jwt');
const checkToken =     expressJwt({secret : process.env.JWT_SECRET , userProperty: 'decodedJwt',algorithms: ['HS256']})
const AppResponseDto = require('../dtos/responses/app.response.dto');
const MembersModel =   require('../models').Members
const StoresModel =    require('../models').Stores

const readToken = (req, res, next) => {
    //Ignore Path is Auth
    const pathIgnore = [
        '/api/v1/auth/login',
        '/api/v1/auth/register',
        '/api/v1/auth/refreshToken',
        '/api/v1/auth/forgot-password',
        '/api/v1/auth/change-password',
        '/api/v1/auth/check-token-change-password'
    ]
    
    if(pathIgnore.includes(req.path) && req.method == 'POST'){
        return next()
    }
    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')
        && req.headers.authorization.split(' ')[0] === 'Bearer' 
        || req.headers.authorization) {
        checkToken(req, res, next)
    } else {
        res.status(401).json({
            status : 401,
            error: 'Unauthorized'
       })
    }
} 

const getFreshUser = () => {
    return (req, res, next) => {
        if(req.decodedJwt){
            //Check Role is Member true | false
            if(req.decodedJwt.role == 'member'){
                MembersModel.findOne({
                    where: {id: req.decodedJwt.member_id},
                    include: [
                        {model: StoresModel}
                    ]
                }).then(member => {
                    if(!member) {
                        // if no user is found, but
                        // it was a valid JWT but didn't decode
                        // to a real user in our DB. Either the user was deleted
                        // since the client got the JWT, or
                        // it was a JWT from some other source
                        res.status(401).send({error: 'Unauthorized'})
                    }else{
                        // update req.user with fresh user from
                        // stale token data
                        req.member = member
                        // console.log('getFreshUser then \n', req.user);
                        next()
                    }
                }).catch(err => {
                    // console.log('getFreshUser catch \n', err);
                    next(err)
                })
            }else if(req.decodedJwt.role == 'superadmin'){
                next()
            }else{
                next()
            }
        }else{
            next()
        }
    }
}

exports.loadUser = [
    readToken,
    getFreshUser()
]
