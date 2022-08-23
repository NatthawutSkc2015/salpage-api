/**
 * @Route Salepage
 * Create, View, Update, Delete
 */
const router = require('express').Router()
const SalepageController = require('../../controllers/salepage.controller')
const uploads = require('../../utils/upload')
const setUploadPath = require('../../middlewares/upload.middleware').setUploadPath
const AuthMiddleware = require('../../middlewares/auth.middleware');

/**
 * @Function get data salepage all for member
 * @call SalepageController @func getSalepages
 *
 */
router.get('/', SalepageController.getSalepages)


/**
 * @Function get data salpage by id
 * @call SalpageController @func getSalepageByID
 *
 */
router.get('/:id', SalepageController.getSalepageByID)



/**
 * @Function save data salepage 
 * @call SalpageController @func createSalepage
 *
 */
router.post('/',
        setUploadPath(uploads.pathImage),
        uploads.upload.any(),
        SalepageController.createSalepage
)

/**
 * @Function update data salepage 
 * @call SalpageController @func updateSalepage
 * 
 */
router.put('/:id',
        setUploadPath(uploads.pathImage),
        uploads.upload.any(),
        SalepageController.updateSalepage
)

/**
 * @Function delete data salpage
 * @call SalpageController @func deleteSalepage
 * 
 */
router.delete('/:id', SalepageController.deleteSalepage)

module.exports = router