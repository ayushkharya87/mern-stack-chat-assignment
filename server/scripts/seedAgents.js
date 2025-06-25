// server/scripts/seedAgents.js
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Agent    = require('../models/Agent');

dotenv.config();

const agents = [
  { email: 'agent@gmail.com', password: '123456' }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true
    });
    console.log('DB connected, seeding agents...');

    for (let a of agents) {
      const exists = await Agent.findOne({ email: a.email });
      if (!exists) {
        const agent = new Agent(a);
        await agent.save();
        console.log(`Created agent: ${a.email}`);
      } else {
        console.log(`Agent ${a.email} already exists`);
      }
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
