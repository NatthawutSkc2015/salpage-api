/**
 * Include @Models
 */
const OrdersModel = require('../models').Orders
const OrderDetailsModel = require('../models').OrderDetails
const SalepagesModel = require('../models').Salepages
const ProductsModel = require('../models').Products
const _ = require('lodash')
const { sequelize, Sequelize } = require('../models/index')
const fs = require('fs')
const { dirname } = require('path')
const appDir = dirname(require.main.filename)

/**
 * Include @Request @Response Handle
 */
const AppResponseDto = require('../dtos/responses/app.response.dto')
const OrderRequestDto = require('../dtos/requests/order.request.dto')
const OrderResponseDto = require('../dtos/responses/order.response.dto')

/**
 * @function get salepages all
 * @condition membercode
 * @param null
 * @return json status and orders data
 */


exports.getOrders = (req, res) => {
    const store_id = req.decodedJwt.store_id

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.page_size) || 12
    const attributesOrders = ['id','order_code','fullname','phone','price_total','payment_method','status']

    Promise.all([

        //Get Salepage all
        OrdersModel.findAll({
            where: {store_id: store_id},
            attributes: attributesOrders,
            offset: (page - 1) * pageSize,
            include: {
                model: SalepagesModel,
                attributes: ['title']
            },
            limit: pageSize,
        }),

        //Get Count Salepage all
        OrdersModel.findAndCountAll({
            where: {store_id: store_id},
            attributes: attributesOrders,
            include: {
                model: SalepagesModel,
                attributes: ['title']
            }
        })
    ]).then(results => {
        
        return res.json(OrderResponseDto.buildOrders(
            results[0],       // => salepage array
            page,             // => page query string
            pageSize,         // => pageSize query string
            results[1].count, // => count order all
            req.baseUrl       // => baseUrl
        ))

    }).catch(error => {
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })
}

/**
 * @function get order by id
 * @params array data
 * @return json status and order data
 */
exports.getOrderByID = (req, res) => {

    const store_id =    req.decodedJwt.store_id
    const order_id =    req.params.id

    Promise.all([

        //Find Order By id, store_id
        OrdersModel.findOne({
            attributes: {
                exclude: ['order_code','store_id','createdAt','updatedAt']
            },
            where: {
                store_id:    store_id,
                id:          order_id
            }
        }),

        //Find Order Detail by id
        OrderDetailsModel.findAll({
            attributes:['price','amount','price_total'],
            where: {
                order_id: order_id
            },
            include: [
                {
                    model: ProductsModel,
                    attributes: ['name','unit','use_stock','image','price']
                }
            ]
        })

    ]).then(results => {

        if(!results[0]){
            return res.status(422).json({
                status:  'unsuccess',
                message: 'Order not found.'
            })
        }

        //Set Image URL NEW
        results[0].slip_image = process.env.IMAGE_URL + results[0].slip_image
        
        return res.json({
            status:   'success',
            order:    results[0],
            order_details : results[1].map(item => {
                // item = item
                // item.Product.image = process.env.IMAGE_URL + item.Product.image
                let inside = {}
                inside['name'] = item.Product.name
                inside['image'] = process.env.IMAGE_URL + item.Product.image
                inside['price'] = item.Product.price
                inside['amount'] = item.amount
                inside['price'] = parseInt(item.price)
                inside['total'] = parseInt(item.price_total)
                return inside
            })
        })

    }).catch(error => {
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })
}

/**
 * @function create order
 * @params array data
 * @return json status and order data
 */
exports.createOrder = async (req, res) => {
    //Send data from body to validate
    const resultBinding = await OrderRequestDto.createOrderRequestDto(req)

    //if validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //If send file from client
        if(req.file){
            //Delete file
            await fs.unlinkSync(appDir + '/../' + req.file.path)
        }
        
        //Response data
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }
    let transac
    let order_id
    try{
        //Start Transaction
        transac =      await sequelize.transaction()
        let store_id = await req.decodedJwt.store_id

        //Find Max ID Order
        let OrderFind = await OrdersModel.findOne({
            attributes: ['id'],
            where: [
                { store_id: store_id }
            ],
            order: [
                ['id', 'DESC'],
            ],
        })

        let max_id = OrderFind ? OrderFind.id + 1 : 1
        Number.padLeft = (nr, len = 2, padChr = `0`) => `${nr < 0 ? `-` : ``}${`${Math.abs(nr)}`.padStart(len, padChr)}`;
        let order_code = 'ORD' + Number.padLeft(max_id, 7)

        //Insert Order
        let order = await OrdersModel.create({
            order_code:       order_code,
            salepage_id:      resultBinding.validatedData.salepage_id,
            store_id:         resultBinding.validatedData.store_id,
            fullname:         resultBinding.validatedData.fullname,
            address:          resultBinding.validatedData.address,
            phone:            resultBinding.validatedData.phone,
            province_id:      resultBinding.validatedData.province_id,
            district_id:      resultBinding.validatedData.district_id,
            sub_district_id:  resultBinding.validatedData.sub_district_id,
            zipcode:          resultBinding.validatedData.zipcode,
            remark:           resultBinding.validatedData.remark,
            status:           resultBinding.validatedData.status,
            slip_image:       resultBinding.validatedData.slip_image,
            price_total:      resultBinding.validatedData.price_total,
            discount:         resultBinding.validatedData.discount,
            payment_method:   resultBinding.validatedData.payment_method,
            shiping_cost:     resultBinding.validatedData.shiping_cost,
            slip_image:       resultBinding.validatedData.slip_image
        },{transaction: transac})

        order_id = order.id


        //Insert Order Details
        let orders = []
        await resultBinding.validatedData.orders.forEach((item, index) => {
            orders[index] =            item
            orders[index].order_id =   order_id
        })
        
        await OrderDetailsModel.bulkCreate(orders,{transaction: transac})

        
        //Transaction Commit
        await transac.commit()

        //Response status
        return await res.json({
            status: 'success',
            insert_last_id: order_id
        })
    }catch(error){
        if(transac) await transac.rollback()
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    }

}

exports.updateOrder = async (req, res) => {
    //Sent data from body to validate
    const resultBinding = await OrderRequestDto.updateOrderRequestDto(req)

    //if validate data not pass
    if(!_.isEmpty(resultBinding.errors)){
        //Response data
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(resultBinding.errors))
    }

    const store_id = req.decodedJwt.store_id

    OrdersModel.update(resultBinding.validatedData,{
        where: {
            store_id: store_id,
            id:       parseInt(req.params.id)
        }
    }).then(rs => {
        //Response status success
        return res.json(AppResponseDto.buildSimpleSuccess())
    }).catch(error => {
        //Response status error
        return res.status(400).json(AppResponseDto.buildWithErrorMessages(error))
    })
}

exports.deleteOrder = async (req, res) => {

    const store_id =  req.decodedJwt.store_id

    /**
     * Find Order by id
     */
    let orderFind = await OrdersModel.findOne({
                            where: {
                                id:       parseInt(req.params.id),
                                store_id: store_id
                            }
                          })
    if(!orderFind){
        return await res.status(400)
                        .json({status: 'unsuccess',message: 'Param id is not found.'})
    }

    /**
     * Delete File Field
     */
    try{
        await fs.unlinkSync(appDir + '/../public' + orderFind.slip_image)
    }catch(e){}

    //Delete Product By ID
    await OrdersModel.destroy({where: {id: req.params.id, store_id: store_id}})

    return await res.json(AppResponseDto.buildSimpleSuccess())
}