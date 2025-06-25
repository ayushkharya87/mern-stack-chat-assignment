const express = require('express');
const router = express.Router();
const {
  registerVendor,
  loginVendor,
  getVendorInfo  ,
  sendMessageToAgent,
  getMessagesWithAgent
} = require('../../controllers/vendor/vendorController');

router.post('/register', registerVendor);
router.post('/login', loginVendor);
router.get('/vendor-info', getVendorInfo );
router.post('/message', sendMessageToAgent);
router.get('/messages', getMessagesWithAgent);

module.exports = router;
