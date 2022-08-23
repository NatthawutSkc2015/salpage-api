const sanitizeInput = require('../../utils/sanitize').sanitizeInput
const StoresModel =   require('../../models').Stores
const MembersModel =  require('../../models').Members

exports.createMemberRequestDto  = async (req) => {

    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body

    // Validate Store Name
    if(!body.store_name || body.store_name.trim() === ''){
        resultBinding.errors.store_name = 'Store name is required'
    }else{
        let store_name = sanitizeInput(body.store_name)

        //Validate is dupplicate 
        let storeFind = await StoresModel.findOne({ where: { store_name: store_name } })
        if(storeFind){
            resultBinding.errors.store_name = 'Store name : ' + store_name + ' is already taken';
        }else{
            resultBinding.validatedData.store_name = store_name
        }
    }

    // Validate Phone
    if(!body.phone || body.phone.trim() === ''){
        resultBinding.errors.phone = 'Phone is required';
    }else{
        let phone = sanitizeInput(body.phone)

        //Validate is dupplicate 
        let memberFind = await MembersModel.findOne({ where: { phone: phone } })
        if(memberFind){
            resultBinding.errors.phone = 'phone number : ' + phone + ' is already taken';
        }else{
            resultBinding.validatedData.phone = sanitizeInput(body.phone);
        }
    }

    //Validate Username
    if(!body.email || body.email.trim() === ''){
        resultBinding.errors.email = 'Username is required';
    }else{
        resultBinding.validatedData.email = sanitizeInput(body.email)

        let email = sanitizeInput(body.email)

        //Validate is dupplicate 
        let emailFind = await MembersModel.findOne({ where: { email: email } })
        if(emailFind){
            resultBinding.errors.email = 'Email : ' + email + ' is already taken';
        }else{
            resultBinding.validatedData.email = email.trim()
        }
    }

    //Validate Password
    if(!body.password || body.password.trim() === ''){
        resultBinding.errors.password = 'Password is required';
    }else{
        resultBinding.validatedData.password = sanitizeInput(body.password);
    }

    resultBinding.validatedData.modules = 'MANAGE_PRODUCT,MANAGE_ORDER,MANAGE_SALEPAGE,MANAGE_USER'

    // let text = "";
    // let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
          
    // for (let i = 0; i < 10; i++){   
    //     text += possible.charAt(Math.floor(Math.random() * possible.length))
    // }

    // resultBinding.validatedData.code = text
    resultBinding.validatedData.status = 'open'


    return await resultBinding
}

exports.loginMemberRequestDto = (req) => {
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body

    //Validate Store Name
    if(!body.email || body.email.trim() === ''){
        resultBinding.errors.email = 'Email is required'
    }else{
        resultBinding.validatedData.email = sanitizeInput(body.email)
    }

    //Validate Phone
    if(!body.password || body.password.trim() === ''){
        resultBinding.errors.password = 'Password is required';
    }else{
        resultBinding.validatedData.password = sanitizeInput(body.password);
    }

    return resultBinding
}


