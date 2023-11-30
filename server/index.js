const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); 
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// Middleware to parse the body of requests in JSON format
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencode
app.use(express.json()); // application/json
// app.use(express.static("./Views/lib"));
app.use(express.static(path.join(__dirname, 'Views')));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));

// ejs
app.set('view engine', 'ejs'); //view engine이 사용할 Template Engine
app.set('views', __dirname + '/Views');

// conection to MongoDB
const url = process.env.MONGO_URL;

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
      // User is authenticated
      next();
    } else {
      // User is not authenticated, redirect to login page
      res.redirect('/login');
    }
};

async function connect(){
    try{
        await mongoose.connect(url);
        console.log("Connected Succesfully...");
    }catch(error){
        console.log(error);
    }
}

connect();

const { Product } = require('./Models/Product'); // 1. 지난 번 만들어 두었던 Product.js(스키마) 임포트
const { User } = require('./Models/User'); //importing user

app.get('/', authenticateUser, (req, res) => {
    res.send(`Hello, ${req.session.userId}!`);
});
  
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/Views/html/main.html');
});

app.post('/register', async (req, res) => {
    try {
        const { ID, password, name, role } = req.body;
      
      // verify if already user
      const existingUser = await User.findOne({ $or: [{ ID }] });
      if (existingUser) {
        return res.status(400).json({ error: 'ID already in use' });
      }
  
      // create new user
      const newUser = new User({ ID, password, name, role });
  
      //saving user
      await User.create({ ID, password, name, role });
  
      res.status(201).json({ message: 'Registration sucessfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error in registering the user' });
    }
  });
  
// Path to login
app.post('/login', async (req, res) => {
    try {
        const { ID, password } = req.body;

        // Search the user by ID
        const user = await User.findOne({ ID });

       // Check if the user exists and the password is correct
        if (user && user.password === password) {
            req.session.userId = user

        } else {
            res.status(401).json({ error: 'Incorrect credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Path to add a new product
app.post('/products', async (req, res) => {
    try {
        // Create a new document using the Product model
        const newProduct = new Product(
        req.body        
        );

        // Save the new product to the database
        const result = await newProduct.save();

        res.json(result); // Return the result as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error... Product coudnt be added' });
    }
});
//curl -X POST -H "Content-Type: application/json" -d '{"name": "고기", "price": 5000}' http://localhost:8000/products

app.delete('/products/name/:productName', async (req, res) => {
    try {
        const productName = req.params.productName;

       // Use the findOneAndDelete method to delete the product by name
        const result = await Product.findOneAndDelete({ name: productName });

        if (result) {
            res.json({ message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);  
        res.status(500).json({ error: 'Error deleting product' });
    }
});
//curl -X DELETE http://localhost:8000/products/name/bread 

// Path to get all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find({});

        res.json(products); // Returns the products in JSON format
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});
//curl http://localhost:8000/products

// route to get the current values of a product by name
app.get('/products/name/:productName', async (req, res) => {
    try {
        const productName = req.params.productName;
       
        const product = await Product.findOne({ name: productName });

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching product' });
    }
});
//curl http://localhost:8000/products/name/apple 

// route to update a product by name
app.put('/products/name/:productName', async (req, res) => {
    try {
        const productName = req.params.productName;
        const { newName, newPrice, newCounts } = req.body;

        const result = await Product.findOneAndUpdate(
            { name: productName },
            { $set: { name: newName, price: newPrice, counts: newCounts } },
            { new: true } // Returns the updated document
        );

        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating product' });
    }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple   

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
console.log('Using collection:', Product.collection.name);


// Views
app.get('/', function(req, res){
    console.log("index page");
    res.sendFile(__dirname + "/Views/html/main.html");
})

app.get('/business', function(req, res){
    console.log("business page");
    res.sendFile(__dirname + "/Views/html/business.html");
})