const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  console.log("pass: ", req.body.password)
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      passwordHash: hashedPassword,
      password: req.body.password
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    console.error(err);  // Imprime el error en la consola del servidor
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//LOGIN
//LOGIN
router.post("/login", async (req, res) => {
  console.log("email: ", req.body.email)
  try {
    const user = await User.findOne({ email: req.body.email });
    console.log("user: ", user);
    

    if (!user) {
      console.log("Entra?")
      return res.status(404).json("User not found"); // Cambiado a un return aquí
    }

    console.log("Ya no sigue")

    const validPassword = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!validPassword) {
      return res.status(400).json("Wrong password"); // Cambiado a un return aquí
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);  // Imprime el error en la consola del servidor
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
