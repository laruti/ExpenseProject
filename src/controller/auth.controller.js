const jwt=require('jsonwebtoken');
const db=require('../util/db');
const bcrypt = require('bcrypt');
const logError = require('../util/logerror');
const config = require('../util/config');


const registerUser = async (req, res) => {
  const { username, email, password } = req.body; 
  // for clinet side 

  // Check if all fields are provided
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  // Hash the password before storing
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // Check if username already exists
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Database error: ' + err.message });
      }

      if (row) {
        return res.status(400).json({
          error: {
            message: "Username has already been taken.",
          },
        });
      }

      // If username is unique, insert the user into the database
      db.run(
        "INSERT INTO users (username, email, hashed_pass) VALUES (?, ?, ?)",
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            console.error('Error inserting user:', err.message);
            return res.status(500).json({ error: 'Failed to register user: ' + err.message });
          }

          // Successfully inserted user, return success message
          return res.status(201).json({
            message: 'User registered successfully!',
            userId: this.lastID,
          });
        }
      );
    });
  } catch (error) {
    logError("auth.register",error,res)
  }
};

const loginUser = async (req, res) => {
  try {
    let { username, password } = req.body;
    const message = {};

    if (!username) {
      message.Username = "Please input Username for Login";
    }
    if (!password) {
      message.Password = "Please input Password for Login";
    }
    if (Object.keys(message).length > 0) {
      return res.status(400).json({ error: message });
    }

    // Query user by username
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if (err) {
        console.error("Database error:", err.message);
        return res.status(500).json({ message: "Database error: " + err.message });
      }

      if (!user) {
        return res.status(400).json({ error: { message: "User not found" } });
      }

      // Compare hashed password
      const isCorrect = bcrypt.compareSync(password, user.hashed_pass);
      if (!isCorrect) {
        return res.status(400).json({ error: { message: "Wrong password!" } });
      }

      // Generate JWT token
      const access_token = jwt.sign(
        { user_id: user.id, username: user.username },
        config.ACCESS_TOKEN_KEY, // Correct variable name
        { expiresIn: "1d" }
      );

      delete user.hashed_pass; // Remove sensitive data

      res.json({
        message: "Login success",
        user,
        access_token: access_token,
      });
    });
  } catch (error) {
    logError("auth.login", error, res);
    res.status(500).json({ message: "Internal server error" });
  }

};
const getLogInUser = async (req, res) => {
  try {
    // Ensure user is logged in
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized, user not authenticated.' });
    }

    // Use the user ID directly from the token
    const userId = req.user.id;

    // Query the database to get the user's details
    db.get("SELECT id, username, email FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Database error: ' + err.message });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return the user's details
      res.json({
        message: "User details retrieved successfully",
        user,
      });
    });
  } catch (error) {
    console.error('Error during user retrieval:', error.message);
    res.status(500).json({ message: 'Failed to retrieve user details', error: error.message });
  }
};

const verify_token = () => {
  return (req, res, next) => {
    var authorization = req.headers.authorization; // Correct way to access headers
    var token_from_client = null; // Use let for reassignment

    if (authorization != null && authorization != "") {
      token_from_client = authorization.split(" ");
      token_from_client = token_from_client[1];
    }

    if (token_from_client == null) {
      return res.status(401).send({
        message: "Unauthorized You need to input token",
      });
    } else {
      jwt.verify(token_from_client, config.ACCESS_TOKEN_KEY, async(error, result) => {
        if (error) {
          return res.status(401).send({
            message: "Unauthorized!!  Input wrong token please check again",
            error: error,
          });
        } else {
          // req.user = result; // Assign the decoded token here
          req.user_id = result.user?.id;
          req.user = result.user;
          next(); //contiue
        }
      });
    }
  };
};

module.exports={
    registerUser,
    loginUser,
    getLogInUser,
    verify_token
}