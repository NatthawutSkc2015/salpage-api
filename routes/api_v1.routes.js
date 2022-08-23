const router = require('express').Router();

router.use('/auth',     require('./v1/auth.routes'))
router.use('/salepage', require('./v1/salepages.routes'))
router.use('/product',  require('./v1/products.routes'))
router.use('/order',    require('./v1/orders.routes'))
router.use('/user',     require('./v1/users.routes'))
module.exports = router