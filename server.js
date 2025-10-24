const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const books = new Map();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.post('/v1/book', (req, res) => {
  const { bookID, bookDescription, bookTitle, bookAuthor } = req.body;

  if (!bookID) {
    return res.status(400).json({
      status: 'error',
      message: 'bookID is required'
    });
  }

  if (books.has(bookID)) {
    return res.status(403).json({
      status: 'error',
      message: 'Another book with the same ID exists'
    });
  }

  const newBook = {
    bookID,
    bookDescription: bookDescription || '',
    bookTitle: bookTitle || '',
    bookAuthor: bookAuthor || ''
  };

  books.set(bookID, newBook);

  res.status(200).json({
    status: 'success',
    message: 'Book created successfully'
  });
});

app.get('/v1/book', (req, res) => {
  const bookList = Array.from(books.values());
  res.status(200).json(bookList);
});

app.get('/v1/book/:bookID', (req, res) => {
  const { bookID } = req.params;

  if (!books.has(bookID)) {
    return res.status(404).json({
      status: 'error',
      message: 'Book not found'
    });
  }

  const book = books.get(bookID);
  res.status(200).json({
    book: book
  });
});

app.put('/v1/book/:bookID', (req, res) => {
  const { bookID } = req.params;
  const { bookDescription, bookTitle, bookAuthor } = req.body;

  if (!books.has(bookID)) {
    return res.status(404).json({
      status: 'error',
      message: 'Book not found'
    });
  }

  const existingBook = books.get(bookID);

  const updatedBook = {
    bookID: existingBook.bookID,
    bookDescription: bookDescription !== undefined ? bookDescription : existingBook.bookDescription,
    bookTitle: bookTitle !== undefined ? bookTitle : existingBook.bookTitle,
    bookAuthor: bookAuthor !== undefined ? bookAuthor : existingBook.bookAuthor
  };

  books.set(bookID, updatedBook);

  res.status(200).json({
    status: 'success',
    message: 'Book updated successfully'
  });
});

app.delete('/v1/book/:bookID', (req, res) => {
  const { bookID } = req.params;

  if (!books.has(bookID)) {
    return res.status(404).json({
      status: 'error',
      message: 'Book not found'
    });
  }

  books.delete(bookID);

  res.status(200).json({
    status: 'success',
    message: 'Book deleted successfully'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Library API Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;