/**
 * Include @Models
 */
const UsersModel = require('../models/index').Members

/**
 * Include @Request @Response Handle
 */
const AppResponseDto = require('../dtos/responses/app.response.dto')
const UserRequestDto = require('../dtos/requests/user.request.dto')
const UserResponseDto = require('../dtos/responses/user.response.dto')

const _ = require('lodash')
const fs = require('fs')
const { dirname } = require('path')
const appDir = dirname(require.main.filename)

/**
 * @function get users all
 * @condition membercode
 * @param null
 * @return json status and users data
 */
exports.getUsers = async (req, res) => {
    
    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.page_size) || 12
    const store_id = req.decodedJwt.store_id

    Promise.all([
        //Get Users all
        UsersModel.findAll({
            attributes: { exclude: ['store_id','password','store_id','createdAt','updatedAt'] },
            where: {
                store_id: store_id
            }
        }),
        //Get Count Users all
        UsersModel.findAndCountAll({
            where: {
                store_id: store_id
            },
            attributes: ['id']
        })
    ]).then(results => {
        //Build response json data
        return res.json(UserResponseDto.buildUser(
            results[0],
            page,
            pageSize,
            results[1].count,
            req.baseUrl
        ))
    }).catch(error => {
        return res.json(AppResponseDto.buildWithErrorMessages(error))
    })
}

/**
 * @function create user
 * @param array data
 * @return json status
 */
exports.createUser = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await UserRequestDto.createUserRequestDto(req)

    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //If send file from frontend
        if(req.file){
            //Delete File
            await fs.unlinkSync(appDir + '/../' + req.file.path)
        }

        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    //Insert User
    UsersModel.create(resultBinding.validatedData)
    .then(rs => {
        //Response status success
        return res.json(AppResponseDto.buildSimpleSuccess())
    })
    .catch(err => {
        //Response status success
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(err))
    })
}

/**
 * @function update user
 * @param array data
 * @return json status and salepage data
 */
exports.updateUser = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await UserRequestDto.updateUserRequestDto(req)
    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //If send file from frontend
        if(req.file){
            //Delete File
            await fs.unlinkSync(appDir + '/../' + req.file.path)
        }

        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    //Update user
    UsersModel.update(resultBinding.validatedData,{
        where: {
            store_id: req.decodedJwt.store_id,
            id:       parseInt(req.params.id),
        }
    })
    .then(rs => {
        //Response status success
        return res.json(AppResponseDto.buildSimpleSuccess())
    })
    .catch(err => {
        //Response status success
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(err))
    })
}

/**
 * @function delete salepage
 * @param id salepage
 * @return json status
 */
exports.deleteUser = (req, res) => {
    res.json({status: 'ok'})
}