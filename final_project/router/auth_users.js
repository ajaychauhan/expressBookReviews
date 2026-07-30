//auth_users.js
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, "utS24hocjnruzxcyjndf", { expiresIn: "1h" });

        req.session.token = token;
        req.session.user = username;
        req.session.save((err) => {
            if (err) return res.status(500).json({ message: "Session save error" });
            res.status(200).json({ message: "Successfully logged in", token: token });
        });
        //return res.status(200).json({ message: "Successfully logged in", token: token });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { review } = req.body;
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews[req.user.username] = review;
    return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews[req.user.username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    delete books[isbn].reviews[req.user.username];

    res.status(200).json({ message: "Review deleted successfully" });
});

regd_users.get("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const userReview = books[isbn].reviews[req.user.username];

    if (!userReview) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    res.status(200).json({ isbn, review: userReview });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
