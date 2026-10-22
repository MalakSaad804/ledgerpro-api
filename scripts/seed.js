require('dotenv').config();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../src/models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL;
  if (await User.findOne({ email })) {
    console.log('Admin already exists');
  } else {
    await User.create({
      name: 'Admin',
      email,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: 'admin',
    });
    console.log('Admin created:', email);
  }
  await mongoose.disconnect();
})();
