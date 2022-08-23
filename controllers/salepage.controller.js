/**
 * Include @Models
 */
const ProductsModel = require('../models').Products
const SalepagesModel = require('../models/index').Salepages
const ContentsModel = require('../models/index').Contents
const ProductsSalepageModel = require('../models').ProductsSalepage
const BanksModel = require('../models/index').Bank
const { sequelize } = require('../models/index')

/**
 * Include @Request @Response Handle
 */

 const AppResponseDto = require('../dtos/responses/app.response.dto')
 const SalepageRequestDto = require('../dtos/requests/salepage.request.dto')
 const SalepageResponseDto = require('../dtos/responses/salepage.response.dto')

const _ = require('lodash')
const fs = require('fs')
const { dirname } = require('path')
const appDir = dirname(require.main.filename)

/**
 * @function get salepages all
 * @condition membercode
 * @param null
 * @return json status and salepage data
 */
exports.getSalepages = async (req, res) => {

    const store_id = req.decodedJwt.store_id

    const page =     parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.page_size) || 12
    const pagi =     req.query.pagi || 'yes'

    try{
        let salepages
        let salepages_count

        if(pagi == 'yes'){
            //Get Salpage all
            salepages = await SalepagesModel.findAll({
                where: { store_id: store_id },
                attributes: ['id','slug','title','description'],
                offset: (page - 1) * pageSize,
                limit: pageSize,
            })

            //Get Count Salepage All
            salepages_count = SalepagesModel.findAndCountAll({
                where: { store_id: store_id },
                attributes: ['id']
            })

            return res.json(SalepageResponseDto.buildSalepage(
                salepages,              // => salpage array
                page,                   // => page query strint
                pageSize,               // => pageSize query string
                salepages_count.count,  // => count salpage all
                req.baseUrl             // => baseURL
            ))
        }else{
            /** Get Salepage All */
            salepages = await SalepagesModel.findAll({
                where: { store_id: store_id },
                attributes: ['id','slug','title','description']
            })

            return res.json({
                status: 'success',
                salepages: salepages
            })
        }

    }catch(e){
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }

    

    // Promise.all([
    //     //Get Salpage all
    //     SalepagesModel.findAll({
    //         where: { store_id: store_id },
    //         attributes: ['id','slug','title','description'],
    //         offset: (page - 1) * pageSize,
    //         limit: pageSize,
    //     }),

    //     //Get Count Salpage all
    //     SalepagesModel.findAndCountAll({
    //         where: { store_id: store_id },
    //         attributes: ['id']
    //     })
    // ]).then(results => {
        
    //     return res.json(SalepageResponseDto.buildSalepage(
    //         results[0],  // => salpage array
    //         page,        // => page query strint
    //         pageSize,    // => pageSize query string
    //         results[1].count,  // => count salpage all
    //         req.baseUrl  // => baseURL
    //     ))

    // }).catch(error => {
    //     return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    // })
}



/**
 * @function get salpage by id
 * @params id
 * @return json status and salpage data
 */
exports.getSalepageByID = async (req, res) => {
    
    const store_id = req.decodedJwt.store_id

    /**
     * Find Salepage by ID, Member Code
     */
    SalepagesModel.findOne({
        attributes: { exclude: ['createdAt','updatedAt'] },
        where: {store_id: store_id , id: req.params.id},
        include : [
            {
                model: BanksModel,
                attributes: { exclude: ['salepage_id','createdAt','updatedAt'] }
            },
            {
                model: ProductsSalepageModel,
                attributes: { exclude: ['salepage_id','createdAt','updatedAt'] },
                include: [
                    {
                        model: ProductsModel,
                        attributes: ['sku_id','name','detail','unit','price','image']
                    }
                ]
            },
            {
                model: ContentsModel,
                attributes: { exclude: ['salepage_id','createdAt','updatedAt'] },
            }
        ]
    })
    .then(salepage => {
        return res.json({
            status: 'success',
            salpages: salepage
        })
    })
    .catch(error => {
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })
}


/**
 * @function create salpage
 * @params array data
 * @return json status and salepage data
 */
exports.createSalepage = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await SalepageRequestDto.createSalepageDto(req)

    //If validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }
    let transac
    let salpage_id 
    try{
        // get transaction
        transac = await sequelize.transaction()

        //-- Step 1 Insert Salpages
        let salepage = await SalepagesModel.create({
            slug:           resultBinding.validatedData.slug,
            title:          resultBinding.validatedData.title,
            description:    resultBinding.validatedData.description,
            keywords:       resultBinding.validatedData.keywords,
            store_id:       resultBinding.validatedData.store_id,
            status:         resultBinding.validatedData.status,
            payment_method: resultBinding.validatedData.payment_method
        }, { transaction: transac })

        salpage_id = salepage.id

        
        //-- Step 2 Insert Contents
        let contents = []
        await resultBinding.validatedData.contents.forEach((item, index) => {
            contents[index] =             item
            contents[index].salepage_id = salpage_id
        })
        await ContentsModel.bulkCreate(contents, { transaction: transac })

        //-- Step 3 Insert Bank
        let banks = []
        await resultBinding.validatedData.banks.forEach((item,index) => {
            banks[index] =                item
            banks[index].salepage_id =    salpage_id
        })
        await BanksModel.bulkCreate(banks, { transaction: transac })

        //-- Step 4 Insert Products Salepage
        let products = []
        await resultBinding.validatedData.products.forEach((item, index) => {
            products[index] =             item
            products[index].salepage_id = salpage_id
        })
        await ProductsSalepageModel.bulkCreate(products, { transaction: transac })
        
        //Transaction Commit
        await transac.commit()
        //Response status
        return await res.json({
            status: 'success',
            insert_last_id : salpage_id
        })

    }catch(error){
        if (transac) await transac.rollback()
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }
}

/**
 * @function update salpage
 * @param array data
 * @return json status and salepage data
 */
exports.updateSalepage = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await SalepageRequestDto.updateSalepageDto(req)

    //Validate data is not pass
    if(!_.isEmpty(resultBinding.errors)){
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }
    let transac
    try{
        //get transaction
        transac = await sequelize.transaction()

        //Get member code from middleware
        const store_id =    await req.decodedJwt.store_id

        //-- Step 1 Update Salpages
        await SalepagesModel.update({
            slug:           resultBinding.validatedData.slug,
            title:          resultBinding.validatedData.title,
            description:    resultBinding.validatedData.description,
            keywords:       resultBinding.validatedData.keywords,
            payment_method: resultBinding.validatedData.payment_method
        },{
            where: {
                id:       parseInt(req.params.id),
                store_id: store_id
            }
        },{ transaction: transac })
        //-- Step 2 Create, Update , Delete Banks from action data
        await resultBinding.validatedData.banks.forEach(async item => {
            
            switch(item.action) {
                case 'create':

                    //Delete action 
                    await delete item.action

                    //Create Bank
                    item.salepage_id = await req.params.id
                    await BanksModel.create(item)
                    break

                case 'update':
                    
                    //Delete action 
                    await delete item.action

                    //If image is not send from client
                    if(!item.image){
                        await delete item.image
                    }else{
                        //Delete File Old
                        try{
                            let banks = await BanksModel.findOne({where: {id: item.id}})
                            await fs.unlinkSync(appDir + '/../public' + banks.image)
                        }catch(e){}

                        await delete item.image_old
                    }

                    //Update Bank
                    await BanksModel.update(item, {where: {id: item.id}})
                    break

                case 'delete':
                    //Delete Image Bank
                    // await fs.unlink(item.image)
                    try{
                        let banks = await BanksModel.findOne({where: {id: item.id}})
                        await fs.unlinkSync(appDir + '/../public' + banks.image)
                    }catch(e){}

                    //Delete Bank by ID
                    await BanksModel.destroy({where: {id: item.id}})
                default:
                    break
            }
        })

        //-- Step 3 Create, Update , Delete Contents from action data
        await resultBinding.validatedData.contents.forEach(async item => {
            
            switch(item.action){

                case 'create':
                    //Delete action
                    await delete item.action

                    //Create Content
                    item.salepage_id = await req.params.id
                    await ContentsModel.create(item)
                    break
                case 'update':

                    //Delete action
                    await delete item.action

                    if(!item.image){
                        await delete item.image
                    }else{
                        //Delete File Old
                        let constent_old = await ContentsModel.findOne({where: {id: item.id}})

                        try{
                            await fs.unlinkSync(appDir + '/../public' + constent_old.content)
                        }catch(e){}

                        await delete item.image_old
                    }

                    await ContentsModel.update(item, {where: {id: item.id}})
                    break
                case 'delete':
                    try{
                        let constent_old = await ContentsModel.findOne({where: {id: item.id}})
                        await fs.unlinkSync(appDir + '/../public' + constent_old.content)
                    }catch(e){}
                    await ContentsModel.destroy({where: {id: item.id}})
                    break
                default:
                    break

            }
        })

        //-- Step 4 Update Products Salepage
        await resultBinding.validatedData.products.forEach(async item => {
            switch(item.action){
                case 'create':
                    //Delete action
                    await delete item.action

                    //Create Product Salepage
                    item.salepage_id = await req.params.id
                    await ProductsSalepageModel.create(item)
                    
                    break
                case 'update':
                    await delete item.action

                    // await delete item.action
                    await ProductsSalepageModel.update(item, {where: {id: item.id}})
                    break
                case 'delete':
                    await ProductsSalepageModel.destroy({where: {id: item.id}})
                    // break
                default:
                    break
            }
        })


        //Transaction Commit
        await transac.commit()

        //Response status
        return await res.json(AppResponseDto.buildSimpleSuccess())

    }catch(error) {
        if(transac) await transac.rollback()
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }

}

/**
 * @function delete salpage
 * @param id salpage
 * @return json status
 */
exports.deleteSalepage = async (req, res) => {

    const store_id =    req.decodedJwt.store_id
    const salpage_id =  req.params.id
    
    /**
     * Find Product by id
     */
    let productFind = await SalepagesModel.findOne({
                                where: {id: salpage_id, store_id: store_id},
                            })

    if(!productFind){
        return await res.status(400)
                        .json(
                            {status: 'unsuccess', message : 'Param id is not found.'}
                        )
    }

    //Find Image Bank
    let images = []
    let banks = await BanksModel.findAll({
                         attributes: ['image'],
                         where: {salepage_id : salpage_id}
                      })
    await banks.forEach(item => {
        images.push(item.image)
    })

    //Find Image Content
    let contents = await ContentsModel.findAll({
                           attributes: ['content'],
                           where: {salepage_id: salpage_id, type: 'image'}
                         })

    //Find Image Content
    await contents.forEach(item => {
        images.push(item.content)
    })

    await images.forEach(item => {
        try{
            fs.unlinkSync(appDir + '/../public' + item)
        }catch(e){}
    })

    // Delete Product By ID
    await SalepagesModel.destroy({ 
        where: { id: req.params.id, store_id: store_id }
    })

    return await res.json(AppResponseDto.buildSimpleSuccess())
}
