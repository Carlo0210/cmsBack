// server.js

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/User');
const providerRoutes = require('./routes/providerRoutes');
const providerServiceRoutes = require('./routes/providerServiceRoutes');
const providerDetailsRoutes = require('./routes/providerDetailsRoutes');
const combinedProviderRoutes = require('./routes/combinedProviderRoutes');
const providerInformationRoutes = require('./routes/providerInformationRoutes');
const path = require('path');

const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;
app.use(cors());
require('./connection')

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'PUT']
  }
})

// Increase the body size limit
app.use(bodyParser.json({ limit: '1024mb' }));
app.use(bodyParser.urlencoded({ limit: '1024mb', extended: true }));

app.use('/users', userRoutes);
app.use('/api', providerRoutes);
app.use('/api', providerServiceRoutes);
app.use('/api', providerDetailsRoutes);
app.use('/apis', providerInformationRoutes);
app.use('/combined-provider', combinedProviderRoutes);


app.delete('/logout', async (req, res) => {
  try {
    const { _id, newMessages } = req.body;
    const user = await User.findById(_id);
    // Perform the necessary operations on user and newMessages here
    await user.save();
    const members = await User.find();
    res.status(200).json( {message: 'Your successfully logout'});
  } catch (e) {
    console.error(e);
    res.status(400).send();
  }
});

// Handle user deletion using a more consistent endpoint
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Failed to delete user.' });
  }
});

app.get('/rooms', (req, res)=> {
  res.json(rooms)
})

app.put('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;

    // Check if a new password is provided
    if (updatedUser.password) {
      const saltRounds = 10; // Adjust the number of salt rounds as needed
      const hashedPassword = await bcrypt.hash(updatedUser.password, saltRounds);
      updatedUser.password = hashedPassword;
    }

    // Update the user in the database
    const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Add this route to handle user deletion
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: 'Failed to delete user.' });
  }
});



// Serve static files from the frontend build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle all other routes by sending the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
});