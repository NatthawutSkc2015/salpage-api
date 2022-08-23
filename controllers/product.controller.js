const ProductsModel = require('../models').Products
const AppResponseDto = require('../dtos/responses/app.response.dto')
const ProductRequestDto = require('../dtos/requests/product.request.dto')
const ProductResponseDto = require('../dtos/responses/product.response.dto')
const { sequelize, Sequelize } = require('../models/index')
const Op = Sequelize.Op
const _ = require('lodash')
const fs = require('fs')
const { dirname } = require('path')
const appDir = dirname(require.main.filename)
/**
 * @function get products all
 * @condition membercode
 * @param null
 * @return json status and salepage data
 */
exports.getProducts = async (req, res) => {
    /**
     * Get member code From Middleware
     */
    const search =   decodeURIComponent(req.query.search ?? '')
    const status =   req.query.status ?? 'open'
    const pagi =     req.query.pagi || 'yes'
    const page =     parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.page_size) || 12
    const offset =   (page - 1) * pageSize
    
    try{
        let products
        let productsCount
        let store_id = req.decodedJwt.store_id

        if(pagi == 'yes'){
            //Get Products all
            products = await ProductsModel.findAll({
                attributes: { exclude: ['store_id','createdAt','updatedAt'] },
                where: {
                    store_id: store_id,
                    name: { [Op.like] : `%${search}%` },
                    status: { [Op.eq] : status }
                },
                offset: offset,
                limit: pageSize,
            })
            //Get Count Salepage all
            productsCount = await ProductsModel.findAndCountAll({
                where: {
                    store_id: store_id,
                    name: { [Op.like] : `%${search}%` },
                    status: { [Op.eq] : status }
                },
                attributes: ['id']
            })

            return res.json(ProductResponseDto.buildProductPagi(
                products,              // => product array
                page,                  // => page query string
                pageSize,              // => pageSize query string
                productsCount.count,   // => count product all
                req.baseUrl            // => baseURL
            ))

        }else{

            products = await ProductsModel.findAll({
                attributes: { exclude: ['store_id','createdAt','updatedAt'] },
                where: {
                    store_id: store_id,
                    name: { [Op.like] : `%${search}%` },
                },
                limit: 8
            })

            return res.json({
                status: 'success',
                products: products.map(item => {
                    item.image = process.env.IMAGE_URL + item.image
                    return item
                })
            })
        }


    }catch(error){
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }

}

/**
 * @function get product by id
 * @condition membercode
 * @param id
 * @return json status and salepage data
 */
exports.getProductByID = (req, res) => {
    
    /**
     * Get Member Code From Middleware
     */
    const store_id =    req.decodedJwt.store_id


    ProductsModel.findOne({
        attributes: { exclude: ['store_id','createdAt','updatedAt'] },
        where: {store_id: store_id, id: req.params.id}
    })
    .then(product => {
        product.image = process.env.IMAGE_URL + product.image
        return res.json({
            status: 'success',
            product: product
        })
    })
    .catch(error => {
        return res.status(400).json(AppResponseDto.buildSuccessWithMessages(error))
    })
}

/**
 * @function create product
 * @params array data
 * @return json status and salepage data
 */
exports.createProduct = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await ProductRequestDto.createProductRequestDto(req)
    
    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //If send file from frontend
        if(req.file){
            //Delete file
            await fs.unlinkSync(appDir + '/../' + req.file.path)
        }
        //Response data
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    //Insert Products
    ProductsModel.create(resultBinding.validatedData)
    .then(rs => {
        //Response status success
        return res.json(AppResponseDto.buildSimpleSuccess())
    })
    .catch(error => {
        //Response status success
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })

}

/**
 * @function update product
 * @params array data
 * @return json status
 */
exports.updateProduct = async (req, res) => {
    //Send data from body to valiable
    const resultBinding = await ProductRequestDto.updateProductRequestDto(req)
    const store_id =     req.decodedJwt.store_id

    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //If send file from client
        if(req.file){
            //Delete file
            await fs.unlinkSync(appDir + '/../' + req.file.path)
        }
        //Response data
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    //Insert Products
    ProductsModel.update(resultBinding.validatedData, {
        where: {
            store_id: store_id,
            id :      parseInt(req.params.id)
        }
    })
    .then(rs => {
        //Response status success
        return res.json(AppResponseDto.buildSimpleSuccess())
    })
    .catch(error => {
        //Response status success
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })
}

exports.deleteProduct = async (req, res) => {

    const store_id = req.decodedJwt.store_id

    /**
     * Find Product by id
     */
    let productFind = await ProductsModel.findOne({ 
                                where: {
                                    id:       parseInt(req.params.id),
                                    store_id: store_id
                                }
                            })
    //Validate
    if(!productFind){
        return await res.status(400)
                        .json(
                            {status: 'unsuccess', message : 'Param id is not found.'}
                        )
    }

    /**
         * Delete File old
         */
    try{
        await fs.unlinkSync(appDir + '/../public' + productFind.image)
    }catch(e){}

    //Delete Product by ID
    await ProductsModel.destroy({ where: 
            { id: parseInt(req.params.id), store_id: store_id }
        }
    )


    return await res.json(AppResponseDto.buildSimpleSuccess())
}