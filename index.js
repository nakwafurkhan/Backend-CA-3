const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.ykqeq.mongodb.net/backendca3' ).then(() => {
    console.log('Connected to DB');
}).catch((err) => {
    console.error('DB connection error:', err.message);
});

// Middleware
app.use(express.json());

// Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    }
});

const User = mongoose.model('User', userSchema);

// Signup Endpoint
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
        return res.status(400).json({ error: "Email cannot be empty" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password cannot be empty" });
    }

    try {
        // Create user
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: "Signup successful" });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Server error" });
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
        return res.status(400).json({ error: "Email cannot be empty" });
    }
    if (!password) {
        return res.status(400).json({ error: "Password cannot be empty" });
    }

    try {
        // Check if user exists and password matches
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});


// Listen to the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
   
});
