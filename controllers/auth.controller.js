const twofactor =          require("node-2fa");
const _ =                  require('lodash')
const AuthRequestDto =     require('../dtos/requests/auth.request.dto')
const AuthResponseDto =    require('../dtos/responses/auth.response.dto')
const AppResponseDto =     require('../dtos/responses/app.response.dto')
const jwt =                require('jsonwebtoken')
const { sequelize } =      require('../models')
const MembersModel =       require('../models').Members
const StoresModel =        require('../models').Stores
const RefreshTokensModel = require('../models').RefreshToken
const ForgotPasswordModel =require("../models").ForgotPassword;
const moment =             require('moment');
const { sanitizeInput } =  require("../utils/sanitize")
const nodemailer =         require('nodemailer')
const crypto =             require('crypto')
const { dirname } =        require('path');

const appDir =             dirname(require.main.filename)
moment.locale('th')

exports.register = async (req, res) => {
    // let result = await StoresModel.findAll()
    // res.json({status: true, result: result})
    // return

    //Verify 2FA
    // const verify = twofactor.verifyToken(process.env.N2FA_SECRET, req.body.pin)
    // if(verify == null || verify.delta === -1 || verify.delta === -3){
    //     return res.status(401).json({
    //         message: 'Pin code is expire.',
    //     })
    // }


    //Send data from body to validate
    const resultBinding = await AuthRequestDto.createMemberRequestDto(req)

    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    let transac
    let store_id
    try{
        //get transaction
        transac = await sequelize.transaction()

        //--- Step 1 Insert Store
        let store = await StoresModel.create({
            store_name : resultBinding.validatedData.store_name,
            slug :       resultBinding.validatedData.store_name.replace(/\s/g, '-')
        }, {transaction: transac})

        store_id = store.id

        //--- Step 2 Insert Member
        await MembersModel.create({
            store_id:  store_id,
            email :    resultBinding.validatedData.email,
            password : resultBinding.validatedData.password,
            phone:     resultBinding.validatedData.phone,
            modules:   resultBinding.validatedData.modules,
            status:    resultBinding.validatedData.status
        }, {transaction: transac})

        //Transaction Commit
        await transac.commit()

        return await res.json(AppResponseDto.buildSimpleSuccess())
    }catch(error){
        if (transac) await transac.rollback()
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }

    //Insert Store
    
}

exports.login =  (req, res) => {


    //Send data from body to validate
    const resultBinding = AuthRequestDto.loginMemberRequestDto(req)

    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    //Prepare Username, Password
    const email = resultBinding.validatedData.email
    const password = resultBinding.validatedData.password

    //Find Member
    MembersModel.findOne({
        where : {email: email},
        include: {
            model: StoresModel
        }
    }).then(async member => {
        if(member && member.isValidatePassword(password)){

            //Response status success
            return res.status(200).json(await AuthResponseDto.loginSuccess(member))
        }else{
            //Response status unsuccess
            return res.status(422).json({
                status: 'unsuccess',
                messsage: 'Invalid username, or password.'
            })
        }
    }).catch(err => {
        //Response status unsuccess
        // return res.json(err)
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(err))
    })
}

exports.forgot_password = async (req, res) => {

    //Validate Email Field
    if(!req.body.email || req.body.email.trim() === ''){
        return res.json(AppResponseDto.buildWithErrorMessages({
            email: 'Email is required.'
        }))
    }

    const email = sanitizeInput(req.body.email)

    //Validate Email from database
    const FindEmail = await MembersModel.findOne({
        where: {
            email: email
        }
    })
    if(!FindEmail){
        return res.status(422).json({
            status: 422,
            mesage: 'Your email is not have in database.'
        })
    }
    
    //Create Instance Send Mail
    const transporter = nodemailer.createTransport({
        port: 465,                              // true for 465, false for other ports
        host: "smtp.gmail.com",
        auth: {
            user: 'macsalepage.info@gmail.com',
            pass: 'Dev@1993Natthawut',
        },
        secure: true,
    });

    //Create Token
    const token = crypto.randomBytes(30).toString('hex')

    const mailData = {
        from:    'macsalepage.info@gmail.com',  // sender address
        to:      email,   // list of receivers
        subject: 'เปลี่ยนรหัสผ่านของคุณ | Macsalepage',
        text:    'That was easy!',
        html:    AuthResponseDto.buildHtmlToContentMail(token),
        // attachments: [
        //     {
        //         filename: 'text -rxbk1drknl27rkqa3.png',
        //         path: appDir + '/../public/images/2022/3/-rxbk1drknl27rkqa3.png'
        //     },
        // ]
    }

    
    transporter.sendMail(mailData, async (err, info) => {
        if(err){
            await res.status(500).json({status: 'error'})
        }else{
            //Save token to data base
            await ForgotPasswordModel.create({
                token:     token,
                member_id: FindEmail.id,
                exp:       Math.round(+new Date()/1000) + 86400,
                status:    'wait'
            })

            await res.json({
                status: 200,
                mesage: `Sent mail to ${email} success.`,
                token:  token
            })
        }
    })
    
}

exports.chang_password = async (req, res) => {
    //Validate Query String [token]
    if(!req.body.token || req.body.token.trim() === ''){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages({
            token: 'token is quired'
        }))
    }

    const token = sanitizeInput(req.body.token)
    //Find data forgot-password
    const findForgotPassword = await ForgotPasswordModel.findOne({
        where: {token: token}
    })

    if(!findForgotPassword){
        return res.status(403).json({
            status: 'unsuccess',
            message: 'token is not in database!'
        })
    }

    await ForgotPasswordModel.update({
        status: 'used'
    },{
        where: {id: parseInt(findForgotPassword.id)}
    })

    //Update Password by id member
    await MembersModel.update({
        password: req.body.password_new
    },{
        where: {
            id: parseInt(findForgotPassword.member_id)
        }
    })

    //Response status success
    return res.json(AppResponseDto.buildSimpleSuccess())
}

exports.userInfo = (req, res) => {
    let member = req.member
    res.json({
        status: 200,
        userInfo: {
            prefix_name: member.Store.store_name.substr(0,2).toUpperCase(),
            store_name:  member.Store.store_name,
            store_slug:  member.Store.slug,
            permission:  member.modules.split(','),
            image:       member.image,
            status:      member.status,
            createdAt:   moment(member.createdAt).format("Do MMM YY h:mm:ss น."),
            updatedAt:   moment(member.updatedAt).format("Do MMM YY h:mm:ss น."),
        }
    })
}

exports.refreshToken = async (req, res) => {

    if(!req.body.refreshToken || req.body.refreshToken.trim() === ''){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages({
            refreshToken: 'refreshToken field required.'
        }))
    }

    let requestToken = sanitizeInput(req.body.refreshToken)

    //Find Refresh Token in db
    let refreshTokenFind = await RefreshTokensModel.findOne({
        where: {token: requestToken},
        include: {
            model: MembersModel
        }
    })


    //If not have refresh token data in database
    if(!refreshTokenFind){
        return res.status(403).json({
            status: 'unsuccess',
            message: 'Refresh token is not in database!'
        })
    }
    
    const now = Math.round(+new Date()/1000)

    //Validate Exp refresh token
    if(parseInt(refreshTokenFind.exp) < now){
        // await RefreshTokensModel.destroy({where: {id: refreshTokenFind.id}})
        return res.status(403).json({
            status: 'unsuccess',
            message: 'Refresh token is expire.'
        })
    }

    //Gen JWT
    const time_exp = Math.round(+new Date()/1000) + parseInt(process.env.JWT_EXP)              
    const token = jwt.sign({
        exp:        time_exp,
        member_id : refreshTokenFind.member_id,
        store_id :  refreshTokenFind.Member.store_id,
        iss :      'salepage',
        role:      'member'
    }, process.env.JWT_SECRET || 'JWT_SUPER_SECRET')

    //Response data
    return res.status(200).json({
        status:       200,
        refreshToken: refreshTokenFind.token,
        token :       token,
        exp:          time_exp,
        exp_refresh:  Number(refreshTokenFind.exp)
    })
    
}

exports.logout = (req, res) => {
    // const authHeader = req.headers.authorization
    // console.log(req.cookies)
    // jwt.sign(authHeader, 1, { expiresIn: 1 } , (logout, err) => {
    //     console.log(logout)
    //     if (logout) {
    //         res.json({msg : 'You have been Logged Out' });
    //     } else {
    //         res.json({msg:'Error'});
    //     }
    // })
}

exports.checkTokenChangePassword = async (req, res) => {

    if(!req.body.token || req.body.token.trim() === ''){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages({
            token: 'token field required.'
        }))
    }

    let token = sanitizeInput(req.body.token)

    //Find Refresh Token in db
    let tokenFind = await ForgotPasswordModel.findOne({
        where: {token: token, status: 'wait'}
    })

    if(!tokenFind){
        return res.status(403).json({
            status: 'unsuccess',
            message: 'token is not in database!'
        })
    }

    const now = Math.round(+new Date()/1000)
    if(parseInt(tokenFind.exp) < now){
        await tokenFind.destroy({where: {id: tokenFind.id}})
        return res.status(403).json({
            status: 'unsuccess',
            message: 'Refresh token is expire.'
        })
    }

    return res.json({
        status: 200,
        message: 'token ok.'
    })

}