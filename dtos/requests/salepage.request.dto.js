const sanitizeInput = require('../../utils/sanitize').sanitizeInput
const SalepagesModel = require('../../models/index').Salepages
const Op = require('../../models/index').Sequelize.Op

exports.createSalepageDto = async (req) => {

    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body

    //Loop Push value
    try{
        req.files.forEach(item => {
            // let key = item.fieldname
            let group = item.fieldname.substr(0, item.fieldname.indexOf('['))
            let index = parseInt(item.fieldname.match(/\d+/g))
            try{ body[group][index].image = item.path.replaceAll('public','') } catch(e){}
        })
    }catch(e){}

    //Validate Slug
    if(!body.slug || body.slug.trim() === ''){
        resultBinding.errors.slug = 'Slug name is required'
    }else{
        let slug = sanitizeInput(body.slug).replace(/\s/g, '-')
        let store_id = req.decodedJwt.store_id
        //Validate is dupplicate 
        let memberFind = await SalepagesModel.findOne({
            where: { 
                    slug:     slug, 
                    store_id: store_id
                } 
            })
        if(memberFind){
            resultBinding.errors.slug = 'Slug : ' + slug + ' is already taken';
        }else{
            resultBinding.validatedData.slug = slug
        }
    }

    //Validate Title
    if(!body.title || body.title.trim() === ''){
        resultBinding.errors.title = 'Title name is required'
    }else{
        resultBinding.validatedData.title = sanitizeInput(body.title)
    }

    //Validate Payment method
    if(!body.payment_method || body.payment_method.trim() === ''){
        resultBinding.errors.payment_method = 'Payment method is required'
    }else{
        resultBinding.validatedData.payment_method = sanitizeInput(body.payment_method).replace(/\s/g, '-')
    }

    //Validate Banks & Prepare data
    try{
        if(body.banks.length > 0){
            body.banks.forEach((item, index) => {
                body.banks[index].bank_name =      item.bank_name ?? ''
                body.banks[index].account_name =   item.account_name ?? ''
                body.banks[index].account_number = item.account_number ?? ''
                body.banks[index].image =          item.image ?? ''
            })
            resultBinding.validatedData.banks = body.banks
        }
    }catch(e){
        resultBinding.validatedData.banks = []
    }


    //Validate Content & Prepare date
    try{
        if(body.contents.length > 0){
            body.contents.forEach((item, index) => {
                let type =                     item.type ?? ''
                let image =                    item.image ?? ''
                let content =                  item.content ?? ''
                body.contents[index].url =     item.url ?? ''
                body.contents[index].type =    type
                body.contents[index].content = (type == 'image') ? image : content
                body.contents[index].link =    item.link ?? ''
                delete body.contents[index].image
            })
            resultBinding.validatedData.contents = body.contents
        }
    }catch(e){
        resultBinding.validatedData.contents = []
    }

    //Validate Products Salepage & Prepare data
    try{
        if(body.products.length > 0){
            body.products.forEach((item, index) => {
                body.products[index].product_id = item.id
                delete body.products[index].id
            })
            resultBinding.validatedData.products = body.products
        }
    }catch(e){
        resultBinding.validatedData.products = []
    }

    resultBinding.validatedData.store_id =    req.decodedJwt.store_id
    resultBinding.validatedData.description = sanitizeInput(body.description)
    resultBinding.validatedData.keywords =    sanitizeInput(body.keywords)
    resultBinding.validatedData.status =      'open'

    return await resultBinding
}

exports.updateSalepageDto = async (req) => {

    var resultBinding = {
        validatedData : {},
        errors : {}
    }

    let body = req.body
    //Loop Push value

    //Validate Salepage by id
    let salepage = await SalepagesModel.findOne({where: {id: req.params.id}})
    if(salepage == null){
        resultBinding.errors.salepage_id = 'Salepage ID is not yours'
    }

    try{
        req.files.forEach(item => {
            // let key = item.fieldname
            let group = item.fieldname.substr(0, item.fieldname.indexOf('['))
            let index = parseInt(item.fieldname.match(/\d+/g))
            try{ body[group][index].image = item.path.replaceAll('public','') } catch(e){}
        })
    }catch(e){}

    //Validate Slug
    if(!body.slug || body.slug.trim() === ''){
        resultBinding.errors.slug = 'Slug name is required'
    }else{
        let slug =     sanitizeInput(body.slug).replace(/\s/g, '-')
        let store_id = req.decodedJwt.store_id
        let id =       parseInt(req.params.id)

        //Validate is dupplicate 
        let memberFind = await SalepagesModel.findOne({ 
                                where: { 
                                    id:       { [Op.not] : id }, 
                                    slug:     { [Op.not] : slug }, 
                                    store_id: store_id
                                } 
                         })
        if(memberFind){
            resultBinding.errors.slug = 'Slug : ' + slug + ' is already taken';
        }else{
            resultBinding.validatedData.slug = slug
        }
    }

    //Validate Title
    if(!body.title || body.title.trim() === ''){
        resultBinding.errors.title = 'Title name is required'
    }else{
        resultBinding.validatedData.title = sanitizeInput(body.title)
    }

    //Validate Payment method
    if(!body.payment_method || body.payment_method.trim() === ''){
        resultBinding.errors.payment_method = 'Payment method is required'
    }else{
        resultBinding.validatedData.payment_method = sanitizeInput(body.payment_method).replace(/\s/g, '-')
    }

    //Validate Banks & Prepare data
    try{
        if(body.banks.length > 0){
            body.banks.forEach((item, index) => {
                body.banks[index].id =              item.id ?? ''
                body.banks[index].bank_name =       item.bank_name ?? ''
                body.banks[index].account_name =    item.account_name ?? ''
                body.banks[index].account_number =  item.account_number ?? ''
                body.banks[index].image =           item.image ?? ''
                body.banks[index].action =          item.action ?? ''
            })
            
            // resultBinding.validatedData.banks = body.banks
            resultBinding.validatedData.banks = body.banks
        }
    }catch(e){
        resultBinding.validatedData.banks = []
    }

    //Validate Content & Prepare data
    try{
        if(body.contents.length > 0){
            await body.contents.forEach((item, index) => {
                let type =                          item.type ?? ''
                let image =                         item.image ?? ''
                let content =                       item.content ?? ''
                body.contents[index].link =         item.link ?? ''
                body.contents[index].content =      (type == 'image') ? image : content
                body.contents[index].action =       item.action ?? ''
            })
            resultBinding.validatedData.contents =   body.contents
        }
    }catch(e){
        resultBinding.validatedData.contents = []
    }

    //Validate Product Salepage & Prepare data
    try{
        if(body.products.length > 0){
            body.products.forEach((item, index) => {
                body.products[index].id =         item.id ?? ''
                body.products[index].product_id = item.product_id ?? ''
                body.products[index].action =     item.action ?? ''
            })
            resultBinding.validatedData.products = body.products
        }
    }catch(e){
        resultBinding.validatedData.products = []
    }
    
    return resultBinding
}