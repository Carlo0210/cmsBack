// const User = require('../models/User');
// const bcrypt = require('bcrypt');

// // Creating a user
// exports.createUser = async (req, res) => {
//     try {
//       let { userType, firstName, middleName, lastName, email, password, picture } = req.body;
  
//       const newUser = new User({ userType, firstName, middleName, lastName, email, password, picture });
//       await newUser.save();
//       res.status(201).json({ message: 'User registered successfully.' });
//     } catch (e) {
//       if (e.code === 11000) {
//         res.status(400).json({ error: 'User already exists' });
//       } else {
//         console.error(e);
//         res.status(500).json({ error: 'Failed to register user.' });
//       }
//     }
//   };
  
//   //Login to the server
// exports.login = async(req, res)=> {
//     try {
//       const {email, password} = req.body;
//       const user = await User.findByCredentials(email, password);
//       await user.save();
//       res.status(200).json(user);
//     } catch (e) {
//         res.status(400).json(e.message)
//     }
//   };

// // Move this outside the socket.io connection
// exports.logout = async (req, res) => {
//     try {
//       const { _id } = req.body;
//       const user = await User.findById(_id);
//       await user.save();
//       res.status(200).json( {message: 'Your successfully logout'});
//     } catch (e) {
//       console.error(e);
//       res.status(400).send();
//     }
//   };
  
//   // Handle user deletion using a more consistent endpoint
// exports.deleteUser = async (req, res) => {
//     try {
//       const userId = req.params.id;
//       await User.findByIdAndDelete(userId);
//       res.status(200).json({ message: 'User deleted successfully.' });
//     } catch (e) {
//       console.error(e);
//       res.status(400).json({ error: 'Failed to delete user.' });
//     }
//   };
  
//   exports.updateUser = async (req, res) => {
//     try {
//       const userId = req.params.id;
//       const updatedUser = req.body;
  
//       // Check if a new password is provided
//       if (updatedUser.password) {
//         const saltRounds = 10; // Adjust the number of salt rounds as needed
//         const hashedPassword = await bcrypt.hash(updatedUser.password, saltRounds);
//         updatedUser.password = hashedPassword;
//       }
  
//       // Update the user in the database
//       const user = await User.findByIdAndUpdate(userId, updatedUser, { new: true });
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
  
//       res.status(200).json(user);
//     } catch (e) {
//       console.error(e);
//       res.status(500).json({ error: 'Failed to update user.' });
//     }
//   };
  
// exports.getAllUser = (req, res) => {
//     User.find()
//     .then(users => res.json(users))
//     .catch(err => res.json(err))
//   };