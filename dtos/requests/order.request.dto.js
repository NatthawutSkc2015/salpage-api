const sanitizeInput = require('../../utils/sanitize').sanitizeInput
const OrdersModel = require('../../models').Orders

exports.createOrderRequestDto = (req) => {
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body =  req.body

    //Validate Image
    if(req.file){
        resultBinding.validatedData.slip_image = req.file.path.replaceAll('public','')
    }

    //Validate fullname
    if(!body.fullname || body.fullname === ''){
        resultBinding.errors.fullname = 'fullname field is required.'
    }else{
        resultBinding.validatedData.fullname =       sanitizeInput(body.fullname)
    }
    
    //Validate address
    if(!body.address || body.address === ''){
        resultBinding.errors.address = 'address field is required.'
    }else{
        resultBinding.validatedData.address =         sanitizeInput(body.address)
    }

    //Validate Phone
    if(!body.phone || body.phone === ''){
        resultBinding.errors.phone = 'phone field is required.'
    }else{
        resultBinding.validatedData.phone =           sanitizeInput(body.phone)
    }

    //Validate Province ID
    if(!body.province_id || body.province_id === ''){
        resultBinding.errors.province_id = 'province_id field is required.'
    }else{
        resultBinding.validatedData.province_id =     parseInt(body.province_id)
    }

    //Validate District ID
    if(!body.district_id || body.district_id === ''){
        resultBinding.errors.district_id = 'district_id field is required.'
    }else{
        resultBinding.validatedData.district_id =     parseInt(body.district_id)
    }

    //Validate Sub District ID
    if(!body.sub_district_id || body.sub_district_id === ''){
        resultBinding.errors.sub_district_id = 'sub_district_id field is required.'
    }else{
        resultBinding.validatedData.sub_district_id = parseInt(body.sub_district_id)
    }

    //Validate Zipcode
    if(!body.zipcode || body.zipcode === ''){
        resultBinding.errors.zipcode = 'zipcode field is required.'
    }else{
        resultBinding.validatedData.zipcode =        parseInt(body.zipcode)
    }

    //Validate Salepage id
    if(!body.salepage_id || body.salepage_id === ''){
        resultBinding.errors.salepage_id = 'salepage_id field is required.'
    }else{
        resultBinding.validatedData.salepage_id =    parseInt(body.salepage_id)
    }

    //Validate Payment Method
    if(!body.payment_method || body.payment_method === ''){
        resultBinding.errors.payment_method = 'payment_method field is required.'
    }else{
        resultBinding.validatedData.payment_method = sanitizeInput(body.payment_method)
    }
         
    resultBinding.validatedData.remark =           parseInt(body.remark)
    resultBinding.validatedData.shiping_cost =     parseInt(body.shiping_cost) ?? 0
    resultBinding.validatedData.discount =         parseInt(body.discount) ?? 0
    resultBinding.validatedData.status =           body.status ?? 'new_order'
    resultBinding.validatedData.store_id =         req.decodedJwt.store_id

    //Validate Orders & Prepare data
    
    try{
        if(body.orders.length > 0){
            let price_total_all =                  0
            let shiping_cost_all =                 parseInt(resultBinding.validatedData.shiping_cost)
            let discount =                         parseInt(resultBinding.validatedData.discount)
            body.orders.forEach( (item, index) => {
                let price =                        parseInt(body.orders[index].price) ?? 0
                let amount =                       parseInt(body.orders[index].amount) ?? 0
                let shiping_cost =                 parseInt(item.shiping_cost) ?? 0
                body.orders[index].product_id =    parseInt(item.product_id) ?? ''
                body.orders[index].price =         price
                body.orders[index].shiping_cost =  shiping_cost
                body.orders[index].amount =        amount
                body.orders[index].price_total =   price * amount + shiping_cost
                price_total_all +=                 (price * amount + shiping_cost)
            })
            resultBinding.validatedData.price_total =  (price_total_all + shiping_cost_all) - discount
            resultBinding.validatedData.orders =       body.orders
        }
    }catch(e){
        resultBinding.errors.orders = 'Orders field is required.' 
    }

    


    return resultBinding
}

exports.updateOrderRequestDto = async (req) => {
    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body =  req.body

    //Validate Order data
    let order = await OrdersModel.findOne({
        where: {id: req.params.id, store_id: req.decodedJwt.store_id}
    })
    if(!order){
        resultBinding.errors.order = 'Your Order not found.'
    }

    //Validate fullname
    if(!body.fullname || body.fullname.trim() === ''){
        resultBinding.errors.fullname = 'fullname field is required.'
    }else{
        resultBinding.validatedData.fullname =       sanitizeInput(body.fullname)
    }
    
    //Validate address
    if(!body.address || body.address.trim() === ''){
        resultBinding.errors.address = 'address field is required.'
    }else{
        resultBinding.validatedData.address =         sanitizeInput(body.address)
    }

    //Validate Phone
    if(!body.phone || body.phone.trim() === ''){
        resultBinding.errors.phone = 'phone field is required.'
    }else{
        resultBinding.validatedData.phone =           sanitizeInput(body.phone)
    }

    //Validate Province ID
    if(!body.province_id || body.province_id.trim() === ''){
        resultBinding.errors.province_id = 'province_id field is required.'
    }else{
        resultBinding.validatedData.province_id =     parseInt(body.province_id)
    }

    //Validate District ID
    if(!body.district_id || body.district_id.trim() === ''){
        resultBinding.errors.district_id = 'district_id field is required.'
    }else{
        resultBinding.validatedData.district_id =     parseInt(body.district_id)
    }

    //Validate Sub District ID
    if(!body.sub_district_id || body.sub_district_id.trim() === ''){
        resultBinding.errors.sub_district_id = 'sub_district_id field is required.'
    }else{
        resultBinding.validatedData.sub_district_id = parseInt(body.sub_district_id)
    }

    //Validate Zipcode
    if(!body.zipcode || body.zipcode.trim() === ''){
        resultBinding.errors.zipcode = 'zipcode field is required.'
    }else{
        resultBinding.validatedData.zipcode =        parseInt(body.zipcode)
    }


    //Validate Payment Method
    if(!body.payment_method || body.payment_method.trim() === ''){
        resultBinding.errors.payment_method = 'payment_method field is required.'
    }else{
        resultBinding.validatedData.payment_method = sanitizeInput(body.payment_method)
    }

    //Validate Status
    if(!body.status || body.status.trim() === ''){
        resultBinding.errors.status = 'status field is required'
    }else{
        resultBinding.validatedData.status = sanitizeInput(body.status)
    }

    return resultBinding
}