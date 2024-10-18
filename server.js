const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 8000;


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ciplaft2023',
    database: 'library'
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});


app.use(cors()); 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'css'))); 

// Rutas

// Página principal - Listar libros
app.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, results) => {
        if (err) throw err;
        res.json(results); 
    });
});

// Ruta para agregar un libro (GET)
app.get('/add-book', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'add-book.html'));
});

// Ruta para guardar un nuevo libro (POST)
app.post('/add-book', (req, res) => {
    const { title, description, stock, saleprice, available } = req.body;
    const sql = 'INSERT INTO books (title, description, stock, saleprice, available) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [title, description, stock, saleprice, available], (err, result) => {
        if (err) throw err;
        res.json({ success: true });
    });
});



// Ruta para obtener los detalles de un libro (GET)
app.get('/edit-book/:bookid', (req, res) => {
  const { bookid } = req.params;
  db.query('SELECT * FROM books WHERE bookid = ?', [bookid], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Error en la base de datos' });
      }
      if (results.length > 0) {
          res.json(results[0]); 
      } else {
          res.status(404).json({ error: 'Libro no encontrado' });
      }
  });
});
// Ruta para actualizar un libro (POST)
app.post('/edit-book/:bookid', (req, res) => {
  const { bookid } = req.params;
  const { title, description, stock, saleprice, available } = req.body;
  
  db.query('UPDATE books SET title = ?, description = ?, stock = ?, saleprice = ?, available = ? WHERE bookid = ?', 
      [title, description, stock, saleprice, available, bookid], (err, results) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Error en la base de datos' });
          }
          res.json({ message: 'Libro actualizado con éxito' });
      });
});

// Ruta para eliminar un libro
app.get('/delete-book/:bookid', (req, res) => {
    const { bookid } = req.params;
    const sql = 'DELETE FROM books WHERE bookid = ?';
    db.query(sql, [bookid], (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Inicia el servidor
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});
