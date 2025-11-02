require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthinsight';

// Seed admin user logic
const seedAdminUser = async () => {
  try {
    const adminEmail = 'admin@123';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('amma@123', salt);

      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

mongoose.connect(MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  seedAdminUser();
})
.catch(err => console.log(err));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/diagnoses', require('./routes/diagnoses'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/questions', require('./routes/questions'));

app.get('/', (req, res) => {
  res.send('HealthInsight Hub API');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});