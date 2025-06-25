const Agent   = require('../../models/Agent');
const Vendor  = require('../../models/Vendor');
const Message = require('../../models/Message');

// login
exports.loginAgent = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  try {
    const agent = await Agent.findOne({ email });
    if (!agent || !(await agent.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    // Return agent info
    res.json({ _id: agent._id, email: agent.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get agent
exports.getDefaultAgent = async (req, res) => {
  try {
    const agent = await Agent.findOne(); // You can enhance logic if needed
    if (!agent) return res.status(404).json({ message: 'No agent found' });
    res.json(agent);
  } catch (err) {
    console.error('Error fetching default agent:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages with vendor
exports.getMessagesWithVendor = async (req, res) => {
  const { vendorId, agentId } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: agentId, receiver: vendorId },
        { sender: vendorId, receiver: agentId }
      ]
    }).sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agent sends message
exports.sendMessageToVendor = async (req, res) => {
  const { sender, receiver, text } = req.body;
  try {
    const msg = new Message({
      sender,
      receiver,
      text,
      senderModel:   'Agent',
      receiverModel: 'Vendor'
    });
    await msg.save();
    res.status(201).json(msg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get vendor info by id
exports.getVendorInfo = async (req, res) => {
  const { vendorId } = req.query;
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ name: vendor.name, email: vendor.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
