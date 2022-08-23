const PageMetaDto = require('./page.meta.response.dto')

exports.buildUser = (users, page, pageSize, totalResource,baseUrl) => {
    return {
        status: 'success',
        page_meta: PageMetaDto.build(users.length, page, pageSize, totalResource, baseUrl),
        users: users.map(item  => {
            let modules = item.modules.split(',') 
            item.modules = modules
            return item
        })
    }
}