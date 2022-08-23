const PageMetaDto = require('./page.meta.response.dto')

exports.buildSalepage = (salepages, page, pageSize, totalResource,baseUrl) => {
    return {
        status: 'success',
        page_meta: PageMetaDto.build(salepages.length,page, 
                                     pageSize, totalResource,baseUrl),
        salpages: salepages
    }    
}