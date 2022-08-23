const PageMetaDto = require('./page.meta.response.dto')

exports.buildProductPagi = (products, page, pageSize, totalResource, baseUrl) => {
    return {
        status: 'success',
        page_meta: PageMetaDto.build(products.length, page,
                                     pageSize, totalResource, baseUrl),
        products: products
    }
}