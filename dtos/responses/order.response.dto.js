const PageMetaDto = require('./page.meta.response.dto')

const getStatusTH = (param) => {
    const value = {
        'new_order' : 'คำสั่งซื้อใหม่',
        'prepare' :   'เตรียมสินค้า',
        'sent' :      'สิ่งสินค้าแล้ว'
    }[param] || ''
    return value
}


exports.buildOrders = (orders, page, pageSize, totalResource, baseUrl) => {
    return {
        status: 'success',
        page_meta: PageMetaDto.build(orders.length , page, pageSize, totalResource, baseUrl),
        orders: orders.map(item => {
            item.status = getStatusTH(item.status)
            return item
        }),
    }    
}