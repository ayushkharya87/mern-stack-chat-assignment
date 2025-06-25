const express = require('express');
const router  = express.Router();
const {
  loginAgent,
  getAllVendors,
  getDefaultAgent,
  getMessagesWithVendor,
  getVendorInfo,  
  sendMessageToVendor
} = require('../../controllers/agent/agentController');


router.post('/login', loginAgent);
router.get('/vendors',  getAllVendors);
router.get('/default',  getDefaultAgent);
router.get('/vendor-info', getVendorInfo);
router.get('/messages', getMessagesWithVendor);
router.post('/message', sendMessageToVendor);

module.exports = router;
