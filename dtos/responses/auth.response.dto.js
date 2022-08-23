const { v4: uuidv4 } =    require('uuid');
const jwt =               require('jsonwebtoken')
const _ =                 require('lodash')
const moment =            require('moment')
const RefreshTokenModel = require('../../models').RefreshToken
const { dirname } =        require('path');
const appDir =             dirname(require.main.filename)
moment.locale('th')

exports.loginSuccess = async (member) => {
    
    //SetTime Exp
    const time_exp1 = Math.round(+new Date()/1000) + parseInt(process.env.REFRESH_TOKEN_EXP)
    const token_ = uuidv4()

    //Create Refresh Token
    const refreshToken = await RefreshTokenModel.create({
        token:      token_,
        member_id : member.id,
        exp:        time_exp1
    })


    const time_exp2 = Math.round(+new Date()/1000) + parseInt(process.env.JWT_EXP)

    const token = jwt.sign(
        {
            exp:        time_exp2,
            member_id : member.id,
            store_id :  member.Store.id,
            iss :      'salepage',
            role:      'member'
        },
        process.env.JWT_SECRET || 'JWT_SUPER_SECRET'
    )
    return {
        status: 200,
        // userInfo: {
        //     prefix_name:     member.Store.store_name.substr(0,2).toUpperCase(),
        //     store_name:      member.Store.store_name,
        //     store_slug:      member.Store.slug,
        //     fullname:        member.fullname,
        //     image:           member.image,
        //     phone:           member.phone,
        //     register_date:   moment(member.createdAt).format("Do MMM YY h:mm:ss น."),
        //     regsiter_update: moment(member.updatedAt).format("Do MMM YY h:mm:ss น."),
        //     permission:      member.modules.split(',')
        // },
        refreshToken: refreshToken.token,
        token :       token,
        exp:          time_exp2,
        exp_refresh:  time_exp1
    }

}

exports.buildHtmlToContentMail =  (token) => {
    return `
        <html content="text/html; charset=utf-8" http-equiv="Content-Type">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
                <style>
                .warper{
                    font-family: 'Prompt', sans-serif;
                    width: 100%;
                }
                .inner{
                    margin:0 auto;
                    width: 400px;
                    border:1px solid #cdcdcd;
                    border-radius:4px;
                    display:block;
                    text-align:center;
                    padding: 2rem 0 2rem 0;
                }
                .app-name{
                    font-size: 1.4rem;
                    font-weight: 200;
                }
                .logo{
                
                }
                hr{
                    margin-left: 2rem;
                    margin-right: 2rem;
                    border-top: 1px solid #c7c7c7;
                }
                .description{
                    font-weight: 200;
                }
                .link{
                    margin-top: 1rem;
                    font-weight: 200;
                    text-decoration:none;
                    border:1px solid #c7c7c7;
                    border-radius: 4px;
                    padding: .2rem 1rem .2rem 1rem;
                    display:inline-block;
                    color: #000;
                }
                </style>
            </head>
            <body>
                <div class="warper">
                    <div class="inner">
                        <img src="${process.env.SALEPAGE_LOGO_URL}">
                        <div class="app-name">ระบบจัดการข้อมูล Salepage</div>
                        <hr />
                        <div class="description">คุณสามารถเปลี่ยนรหัสผ่านของคุณได้ที่ลิงค์</div>
                        <a class="link" href="${process.env.SALEPAGE_SET_PASSWORD_URL + token}">GO ...</a>
                    </div>
                </div>
            </body>
        </html>
    `
}