//general.js
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered." })
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);;
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) return res.status(200).json(book);
    return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const found = Object.values(books).filter(b => b.author === author);
    return res.status(200).json(found);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;     
    if (!title) {
        return res.status(400).json({ message: "Title parameter is required" });
    }
    const found = Object.values(books).filter(b => 
        b.title.toLowerCase().includes(title.toLowerCase())
    );
    return res.status(200).json(found);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found" });
    return res.status(200).json(book.reviews);
});

public_users.get('/callback', (req, res) => {
    const API_URL = "http://localhost:5000" ;
    
    axios.get(API_URL, { params: { limit: 10 }, timeout: 5000 })
      .then(response => {
        const books = Object.entries(response.data).map(([isbn, book]) => ({
          isbn: book.isbn ? book.isbn[0] : 'N/A',
          title: book.title,
          author: book.author_name ? book.author_name[0] : 'Unknown',
          reviews: {}
        }));
        res.status(200).json(books);
      })
      .catch(error => {
        console.error('Axios Error:', error.message);
        res.status(500).json({ message: "Failed to fetch books from external API" });
      });
  });

module.exports.general = public_users;
