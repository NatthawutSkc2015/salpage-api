/**
 * @Route Products
 * Create, View, Update, Delete
 */
const router = require('express').Router()
const ProductControler = require('../../controllers/product.controller')
const AuthMiddleware = require('../../middlewares/auth.middleware');
const uploads = require('../../utils/upload')
const setUploadPath = require('../../middlewares/upload.middleware').setUploadPath

/**
 * @Function get data salepage all for member
 * @call ProductControler @func getProducts
 *
 */
router.get('/', ProductControler.getProducts)

/**
 * @Function get data salpage by id
 * @call ProductControler @func getProductByID
 *
 */
router.get('/:id', ProductControler.getProductByID)

/**
 * @Function save data salepage 
 * @call ProductControler @func createProduct
 *
 */
router.post('/',
        setUploadPath(uploads.pathImage),
        uploads.upload.single('image'),
        ProductControler.createProduct
)

/**
 * @Function update data salpage
 * @call ProductController @func updateProduct
 * 
 */
router.put('/:id',
        setUploadPath(uploads.pathImage),
        uploads.upload.single('image'),
        ProductControler.updateProduct
)

/**
 * @Function delete data salpage
 * @call SalpageController @func deleteSalepage
 * 
 */
router.delete('/:id', ProductControler.deleteProduct)

module.exports = router