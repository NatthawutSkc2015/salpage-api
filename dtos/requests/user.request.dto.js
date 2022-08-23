let sanitizeInput = require('../../utils/sanitize').sanitizeInput
let UsersModel = require('../../models').Members
let { Sequelize } = require('../../models')
let Op = Sequelize.Op
exports.createUserRequestDto = async (req) => {
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body =     req.body
    let store_id = req.decodedJwt.store_id

    //Validate Image
    if(!req.file){
        resultBinding.errors.image = 'Image is required.'
    }else{
        resultBinding.validatedData.image = req.file.path.replaceAll('public','')
    }

    //Validate Username
    if(!body.username || body.username.trim() === ''){
        resultBinding.errors.username = 'Username is required.';
    }else{
        resultBinding.validatedData.username = sanitizeInput(body.username)

        let username = sanitizeInput(body.username)

        //Validate is dupplicate 
        let usernameFind = await UsersModel.findOne({ where: { username: username, store_id: store_id } })
        if(usernameFind){
            resultBinding.errors.username = 'Username : ' + username + ' is already taken'
        }else{
            resultBinding.validatedData.username = username.trim()
        }
    }

    //Validate Password
    if(!body.password || body.password.trim() === ''){
        resultBinding.errors.password = 'Password is required.';
    }else{
        resultBinding.validatedData.password = sanitizeInput(body.password)
    }

    //Validate Modules
    if(!body.modules || body.modules.trim() === ''){
        resultBinding.errors.modules = 'Modules is required.'
    }else{
        resultBinding.validatedData.modules = sanitizeInput(body.modules)
    }

    //Validate Status
    if(!body.status || body.status.trim() === ''){
        resultBinding.errors.status = 'Status is required.'
    }else{
        resultBinding.validatedData.status = sanitizeInput(body.status)
    }
    

    resultBinding.validatedData.store_id = store_id

    return  resultBinding
}

exports.updateUserRequestDto = async (req) => {
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body
    let id = parseInt(req.params.id)
    let username = sanitizeInput(body.username)
    let store_id = req.decodedJwt.store_id

    //Validate User
    let userFind = await UsersModel.findOne({
            where: {
                id: id,
                store_id: store_id
            }
        })
    if(!userFind){
        resultBinding.errors.user = 'User not found.'
    }

    //Validate Image
    if(req.file){
        resultBinding.validatedData.image = req.file.path.replaceAll('public','')
    }

    //Validate Username
    if(!body.username || body.username.trim() === ''){
        resultBinding.errors.username = 'Username is required.';
    }else{
        resultBinding.validatedData.username = sanitizeInput(body.username)

        //Validate is dupplicate 
        let usernameFind = await UsersModel.findOne({
                                    where: {
                                        id:       { [Op.not] : id }, 
                                        username: { [Op.eq] : username }, 
                                        store_id: store_id
                                    }
                                 })            
        if(usernameFind){
            resultBinding.errors.username = 'Username : ' + username + ' is already taken'
        }else{
            resultBinding.validatedData.username = username.trim()
        }
    }

    //Validate Password
    if(body.password && body.password.trim() !== ''){
        resultBinding.validatedData.password = sanitizeInput(body.password)
    }

    //Validate status
    if(!body.status || body.status.trim() === ''){
        resultBinding.errors.status = 'Status is required.'
    }else{
        resultBinding.validatedData.status = sanitizeInput(body.status)
    }

    //Validate Modules
    if(!body.modules || body.modules.trim() === ''){
        resultBinding.errors.modules = 'Modules is required.'
    }else{
        resultBinding.validatedData.modules = sanitizeInput(body.modules)
    }

    resultBinding.validatedData.modules = sanitizeInput(body.modules)

    return  resultBinding
}
