/**
 * @Route Orders
 * Create, View, Update, Delete
 */
const router = require('express').Router()
const OrderController = require('../../controllers/order.controller')
const AuthMiddleware = require('../../middlewares/auth.middleware')
const uploads = require('../../utils/upload')
const setUploadPath = require('../../middlewares/upload.middleware').setUploadPath

/**
 * @Function get data orders all for member
 * @call OrderController @func getOrders
 * @method GET
 */
router.get('/', OrderController.getOrders)

/**
 * @Function get data order by id
 * @call OrderController @func getOrderByID
 * @method GET
 */
router.get('/:id', OrderController.getOrderByID)

/**
 * @Function save data order 
 * @call OrderController @func createOrder
 * @method POST
 */
router.post('/',
    setUploadPath(uploads.pathImage),
    uploads.upload.single('slip_image'),
    OrderController.createOrder
)

/**
 * @Function save data order 
 * @call OrderController @func updateOrder
 * @method PUT
 */
router.put('/:id',
    uploads.upload.none(), 
    OrderController.updateOrder)

/**
 * @Function delete data salpage
 * @call SalpageController @func deleteOrder
 * @method PUT
 */
router.delete('/:id', OrderController.deleteOrder)

module.exports = router