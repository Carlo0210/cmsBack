const router = require('express').Router();
const User = require('../models/User');

// Creating a user
router.post('/', async (req, res) => {
  try {
    let { userType, firstName, middleName, lastName, email, password, picture } = req.body;

    const newUser = new User({ userType, firstName, middleName, lastName, email, password, picture });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (e) {
    if (e.code === 11000) {
      res.status(400).json({ error: 'User already exists' });
    } else {
      console.error(e);
      res.status(500).json({ error: 'Failed to register user.' });
    }
  }
});


router.post('/login', async(req, res)=> {
  try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    await user.save();
    res.status(200).json(user);
  } catch (e) {
      res.status(400).json(e.message)
  }
})


module.exports = router;
