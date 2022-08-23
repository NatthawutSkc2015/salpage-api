/**
 * @Route Salepage
 * Create, View, Update, Delete
 */
const router = require('express').Router()
const UserController = require('../../controllers/user.controller')
const uploads = require('../../utils/upload')
const setUploadPath = require('../../middlewares/upload.middleware').setUploadPath

/**
 * @function get data salepage all for member
 * @call UserController @func getUsers
 *
 */
router.get('/', UserController.getUsers)

/**
 * @function create user
 * @call UserControler @func createUser
 *
 */
router.post('/',
        setUploadPath(uploads.pathImage),
        uploads.upload.single('image'),
        UserController.createUser
)

/**
 * @function update user
 * @call UserController @func updateUser
 * 
 */
router.put('/:id',
        setUploadPath(uploads.pathImage),
        uploads.upload.single('image'),
        UserController.updateUser
)


/**
 * @function delete data salpage
 * @call UserControler @func deleteUser
 * 
 */
router.delete('/:id', UserController.deleteUser)



module.exports = router