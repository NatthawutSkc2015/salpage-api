//Code old
const multer = require('multer');
const fs = require('fs');
const uniqid = require('uniqid'); 
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        let destPath = req.uploadPath
        let date = new Date
        // if (!fs.existsSync(destPath)){
        //     fs.mkdirSync(destPath)
        // }
        if (!fs.existsSync(destPath + date.getFullYear())){
            fs.mkdirSync(destPath + date.getFullYear())
        }

        destPath = destPath + date.getFullYear() + '/' + date.getMonth() + '/'
        if (!fs.existsSync(destPath)){
            fs.mkdirSync(destPath)
        }
        
        callback(null, destPath)
    },
    // fileFilter: function(req, file, callback){
    //     callback(null, false)
    // },
    filename: function (req, file, callback) {
        const parts = file.originalname.split(".");
        const extension = parts[parts.length - 1]
        let group = file.fieldname.substr(0, file.fieldname.indexOf('['))
        let fileName = group + '-' + uniqid();
        if (extension === 'png' || extension === 'jpeg' || extension === 'jpg')
            fileName += '.' + extension;

        callback(null, fileName);
    }
});

const upload = multer({storage: storage});
const pathPublic = './public/'
const pathImage = './public/images/'
const pathDocs = './public/docs/'

module.exports = { upload, pathImage, pathDocs,pathPublic };
