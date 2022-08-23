const sanitizeInput = require('../../utils/sanitize').sanitizeInput
const ProductsModel = require('../../models/index').Products
const { Sequelize } = require('../../models/index')
const Op = Sequelize.Op

exports.createProductRequestDto = async (req) => {
    
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body
    let store_id = req.decodedJwt.store_id

    //Validate Image
    if(!req.file){
        resultBinding.errors.image = 'image is required.'
    }else{
        resultBinding.validatedData.image = req.file.path.replaceAll('public','')
    }

    //Validate sku_id
    if(!body.sku_id || body.sku_id.trim() === ''){
        resultBinding.errors.sku_id = 'sku id is required.'
    }else{
        let sku_id = sanitizeInput(body.sku_id)


        //Validate is dupplicate
        let skuFind = await ProductsModel.findOne({
            where: {
                sku_id : sku_id,
                store_id : store_id
            }
        })

        if(skuFind){
            resultBinding.errors.sku_id = 'Sku ID ' + sku_id + ' is already taken'
        }else{
            resultBinding.validatedData.sku_id = sanitizeInput(body.sku_id)
        }
    }

    //Validate name
    if(!body.name || body.name.trim() === ''){
        resultBinding.errors.name = 'name is required.'
    }else{
        resultBinding.validatedData.name = sanitizeInput(body.name)
    }

    //Validate detail
    if(!body.detail || body.detail.trim() === ''){
        resultBinding.errors.detail = 'detail is required.'
    }else{
        resultBinding.validatedData.detail = sanitizeInput(body.detail)
    }

    //Validate unit
    if(!body.unit || body.unit.trim() === ''){
        resultBinding.errors.unit = 'unit is required.'
    }else{
        resultBinding.validatedData.unit = sanitizeInput(body.unit)
    }

    //Validate price
    if(!body.price || body.price.trim() === ''){
        resultBinding.errors.price = 'price is required.'
    }else{
        resultBinding.validatedData.price = sanitizeInput(body.price)
    }

    //Validate use_stock
    if(!body.use_stock || body.use_stock.trim() === ''){
        resultBinding.errors.use_stock = 'use_stock is required.'
    }else{
        resultBinding.validatedData.use_stock = sanitizeInput(body.use_stock)
    }

    //Validate in_stock
    resultBinding.validatedData.in_stock = sanitizeInput(body.in_stock)

    resultBinding.validatedData.noti_min_stock = parseInt(body.noti_min_stock)

    //Validate const_per_price
    resultBinding.validatedData.cost_per_price = sanitizeInput(body.cost_per_price)

    resultBinding.validatedData.store_id = store_id
    resultBinding.validatedData.status = 'open'

    return resultBinding
}

exports.updateProductRequestDto = async (req) => {

    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body

    //Validate product by id
    let productFind = await ProductsModel.findOne({
                            where: {
                                id: parseInt(req.params.id),
                                store_id: req.decodedJwt.store_id
                            }
                        })
    if(!productFind){
        resultBinding.errors.product = 'This listing is not for you.'
    }

    //Validate Image
    if(req.file){
        resultBinding.validatedData.image = req.file.path.replaceAll('public','')
    }

    //Validate sku_id
    if(!body.sku_id || body.sku_id.trim() === ''){
        resultBinding.errors.sku_id = 'sku id is required.'
    }else{
        let sku_id =   sanitizeInput(body.sku_id)
        let store_id = req.decodedJwt.store_id
        let id =       parseInt(req.params.id)

        //Validate is dupplicate
        let skuFind = await ProductsModel.findOne({
            where: {
                id:          { [Op.not] : id },
                sku_id :     { [Op.eq] : sku_id },
                store_id :   store_id
            }
        })

        if(skuFind){
            resultBinding.errors.sku_id = 'Sku ID ' + sku_id + ' is already taken'
        }else{
            resultBinding.validatedData.sku_id = sanitizeInput(body.sku_id)
        }
    }

    //Validate name
    if(!body.name || body.name.trim() === ''){
        resultBinding.errors.name = 'name is required.'
    }else{
        resultBinding.validatedData.name = sanitizeInput(body.name)
    }

    //Validate detail
    if(!body.detail || body.detail.trim() === ''){
        resultBinding.errors.detail = 'detail is required.'
    }else{
        resultBinding.validatedData.detail = sanitizeInput(body.detail)
    }

    //Validate unit
    if(!body.unit || body.unit.trim() === ''){
        resultBinding.errors.unit = 'unit is required.'
    }else{
        resultBinding.validatedData.unit = sanitizeInput(body.unit)
    }

    //Validate price
    if(!body.price || body.price.trim() === ''){
        resultBinding.errors.price = 'price is required.'
    }else{
        resultBinding.validatedData.price = sanitizeInput(body.price)
    }

    //Validate status
    if(!body.status || body.status.trim() === ''){
        resultBinding.errors.status = 'status is required.'
    }else{
        resultBinding.validatedData.status = sanitizeInput(body.status)
    }

    //Validate use_stock
    if(!body.use_stock || body.use_stock.trim() === ''){
        resultBinding.errors.use_stock = 'use_stock is required.'
    }else{
        resultBinding.validatedData.use_stock = sanitizeInput(body.use_stock)
    }

    //Validate in_stock
    resultBinding.validatedData.in_stock = sanitizeInput(body.in_stock)

    resultBinding.validatedData.noti_min_stock = parseInt(body.noti_min_stock)

    //Validate const_per_price
    resultBinding.validatedData.cost_per_price = sanitizeInput(body.cost_per_price)

    return resultBinding
}