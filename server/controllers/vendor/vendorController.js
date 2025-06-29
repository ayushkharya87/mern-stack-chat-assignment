const Vendor = require('../../models/Vendor');
const Message = require('../../models/Message');

// Register  vendor
exports.registerVendor = async (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    confirmPassword,
    shopName,
    shopCategory,
    address,
    city,
    state,
    country,
    businessLicenseNo,
    gstNumber
  } = req.body;

  // Basic field validation
  if (!name || !email || !phone || !password || !confirmPassword ||
      !shopName || !shopCategory || !address || !city || !state ||
      !country || !gstNumber) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: 'Vendor already registered with this email.' });
    }

    const vendor = new Vendor({
      name,
      email,
      phone,
      password,
      shopName,
      shopCategory,
      address,
      city,
      state,
      country,
      businessLicenseNo,
      gstNumber
    });

    await vendor.save();

    res.status(201).json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      shopName: vendor.shopName,
      shopCategory: vendor.shopCategory,
      address: vendor.address,
      city: vendor.city,
      state: vendor.state,
      country: vendor.country,
      businessLicenseNo: vendor.businessLicenseNo,
      gstNumber: vendor.gstNumber
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Vendor login
exports.loginVendor = async (req, res) => {
  const { email, password } = req.body;

  // basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // find vendor
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // compare password using your schema method
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // respond with vendor data (omit password)
    res.json({
      _id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Get vendor info
exports.getVendorInfo = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.query.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      name: vendor.name,
      email: vendor.email
    });
  } catch (error) {
    console.error('Error fetching vendor info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  Send message to agent
exports.sendMessageToAgent = async (req, res) => {
  const { sender, receiver, text } = req.body;

  if (!sender || !receiver || !text) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const msg = new Message({
      sender,
      receiver,
      text,
      senderModel: 'Vendor',
      receiverModel: 'Agent'
    });

    await msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages with agent
exports.getMessagesWithAgent = async (req, res) => {
  const { vendorId, agentId } = req.query;

  if (!vendorId || !agentId) {
    return res.status(400).json({ message: 'Vendor and Agent IDs are required.' });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: vendorId, receiver: agentId },
        { sender: agentId, receiver: vendorId }
      ]
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
