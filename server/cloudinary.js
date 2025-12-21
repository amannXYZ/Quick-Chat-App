const cloudinary = require('cloudinary');

cloudinary.config({ 
    cloud_name: 'dlctdocbd', 
    api_key: '797479235757813', 
    api_secret: 'dVrxcosNyzQx1wZZAqtJ7bBTwyo'
  });

  module.exports = cloudinary;