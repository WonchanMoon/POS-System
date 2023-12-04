const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const moment = require('moment')

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const dateNow = moment().format('YYYY-MM-DD HH:mm:ss')
const app = express();
const port = process.env.PORT;
const saltRounds = 10;
var globalID = null;

// Middleware to parse the body of requests in JSON format
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencode
app.use(express.json()); // application/json
// app.use(express.static("./Views/lib"));
app.use(express.static(path.join(__dirname, 'Views')));

// ejs
app.set('view engine', 'ejs'); //view engine이 사용할 Template Engine
app.set('views', __dirname + '/Views');

// conection to MongoDB
const url = process.env.MONGO_URL;

async function connect() {
  try {
    await mongoose.connect(url);
    console.log('Connected Succesfully...');
  } catch (error) {
    console.log(error);
  }
}

connect();

const { Product } = require('./Models/Product'); // importing product
const { User } = require('./Models/User'); //importing user
const { Discount } = require('./Models/Discount'); //importing discount
const { Sales } = require('./Models/Sales'); //importing sales

app.post('/register', async (req, res) => {
  try {
    const ID = req.body.ID;

    // verify if the user already exists
    const existingUser = await User.findOne({ ID });
    if (existingUser) {
      res.status(400).json({ error: 'ID already in use' });
    } else {
      // create a new user
      const newUser = new User(req.body);

      // password hashing with bcrypt
      const hashedPassword = await bcrypt.hash(newUser.password, saltRounds);
      newUser.password = hashedPassword;

      // saving user
      const result = await newUser.save();
      console.log('register success');
      res.json(result);
      // res.status(200).json({ message: 'Registration successful' });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: `Error in registering the user: ${error.message}` });
  }
});

// Path to login
app.post('/login', async (req, res) => {
  try {
    if (globalID) {
      console.log('session exists');
      res.status(200).json({ messagee: 'login success' });
    } else {
      const { ID, password } = req.body;
      // Search the user by ID
      const user = await User.findOne({ ID });
      // Check if the user exists and the password is correct
      if (user && (await bcrypt.compare(password, user.password))) {
        globalID = user.ID;
        res.status(200).json({ messagee: 'login success' });
      } else {
        res.status(401).json({ error: 'Incorrect credentials' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

//get users
app.get('/users', async (req, res) => {
  try {
    const user = await User.find({});
    res.json(user); // Returns the products in JSON format
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/logout', async (req, res) => {
  try {
    globalID = null;

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

///////////////////////
//////////////////////
//product
//////////////////////
// Path to add a new product
app.post('/products', async (req, res) => {
  try {
    post = Object.assign(req.body, { ID: globalID });
    // Create a new document using the Product model
    const newProduct = new Product(
      post
      // req.body
    );

    // Save the new product to the database
    const result = await newProduct.save();

    res.json(result); // Return the result as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error the product could not be added' });
  }
});
//curl -X POST -H "Content-Type: application/json" -d '{"name": "고기", "price": 5000}' http://localhost:8000/products

app.delete('/products/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;

    // Use the findOneAndDelete method to delete the product by name
    const result = await Product.findOneAndDelete({
      ID: globalID,
      name: productName,
    });
    if (result) {
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at deleting product' });
  }
});
//curl -X DELETE http://localhost:8000/products/name/bread

// Path to get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({ ID: globalID });

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

    const product = await Product.findOne({ ID: globalID, name: productName });

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
      { ID: globalID, name: productName },
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
    res.status(500).json({ error: 'Error at updating product' });
  }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple

app.put('/products/counts/:productName', async (req, res) => {
  try {
    // const productName = req.params.productName;
    const { name, counts } = req.body;

    const product = await Product.findOne({ ID: globalID, name: name });
    var ncounts = product.counts;
    console.log(ncounts);
    const result = await Product.findOneAndUpdate(
      { ID: globalID, name: name },
      { $set: {counts: (ncounts-counts) } },
      { new: true } // Returns the updated document
    );

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at updating product' });
  }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple


// Path to add a new discount
app.post('/discount', async (req, res) => {
  post = Object.assign(req.body, { ID: globalID });
  try {
    // Create a new document using the Product model
    const newDiscount = new Discount(
      // req.body
      post
    );
    // Save the new product to the database
    const result = await newDiscount.save();

    res.json(result); // Return the result as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error the discount could not be added' });
  }
});
//curl -X POST -H "Content-Type: application/json" -d '{"name": "고기", "price": 5000}' http://localhost:8000/products

app.delete('/discount/name/:name', async (req, res) => {
  try {
    const name = req.params.name;

    // Use the findOneAndDelete method to delete the product by name
    const result = await Discount.findOneAndDelete({
      ID: globalID,
      name: name,
    });

    if (result) {
      res.json({ message: 'Discount deleted successfully' });
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at deleting discount' });
  }
});
//curl -X DELETE http://localhost:8000/products/name/bread

// Path to get all products
app.get('/discount', async (req, res) => {
  try {
    const discount = await Discount.find({ ID: globalID });

    res.json(discount); // Returns the products in JSON format
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching discount' });
  }
});
//curl http://localhost:8000/products

// route to get the current values of a product by name
app.get('/discount/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;

    const discount = await Discount.findOne({
      ID: globalID,
      name: productName,
    });

    if (discount) {
      res.json(discount);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching discount' });
  }
});
//curl http://localhost:8000/products/name/apple

// route to update a product by name
app.put('/discount/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;
    const { newDiscountNum, newDate } = req.body;

    const result = await Discount.findOneAndUpdate(
      { ID: globalID, name: productName },
      { $set: { discount: newDiscountNum, date: newDate } },
      { new: true } // Returns the updated document
    );

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at updating Discount' });
  }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
//////////////sales////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
// Path to add a new sales
app.post('/salesList', async (req, res) => {
  try {
    // Create a new document using the Product model
    post = Object.assign(req.body, {ID: globalID , date : dateNow});
    const newSales = new Sales(
      // req.body
      post
    );
    console.log(req.body);
    // Save the new product to the database
    const result = await newSales.save();

    res.json(result); // Return the result as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error the sales could not be added' });
  }
});
//curl -X POST -H "Content-Type: application/json" -d '{"name": "고기", "price": 5000}' http://localhost:8000/products

// Path to get all products
app.get('/salesList', async (req, res) => {
  try {
    const sales = await Sales.find({ ID: globalID });

    res.json(sales); // Returns the products in JSON format
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching sales' });
  }
});
//curl http://localhost:8000/products

// 미정
app.delete('/salesList/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;

    // Use the findOneAndDelete method to delete the product by name
    const result = await Discount.findOneAndDelete({ name: productName });

    if (result) {
      res.json({ message: 'Discount deleted successfully' });
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at deleting discount' });
  }
});
//curl -X DELETE http://localhost:8000/products/name/bread

// route to get the current values of a product by name
app.get('/discount/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;

    const discount = await Discount.findOne({ name: productName });

    if (discount) {
      res.json(discount);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching discount' });
  }
});
//curl http://localhost:8000/products/name/apple

// route to update a product by name
app.put('/discount/name/:productName', async (req, res) => {
  try {
    const productName = req.params.productName;
    const { newDiscountNum, newDate } = req.body;

    const result = await Discount.findOneAndUpdate(
      { name: productName },
      { $set: { discount: newDiscountNum, date: newDate } },
      { new: true } // Returns the updated document
    );
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Discount not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error at updating Discount' });
  }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
console.log('Using collection:', Product.collection.name);

// Views

app.get('/', function (req, res) {
  console.log('index page');
  if (!globalID) {
    res.sendFile(__dirname + '/Views/html/main.html');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function (req, res) {
  console.log('index page');
  if (!globalID) {
    res.sendFile(__dirname + '/Views/html/main.html');
  } else {
    res.redirect('/business');
  }
});

app.get('/business', function(req, res){
    console.log("business page");
    if(globalID){
        res.sendFile(__dirname + "/Views/html/business.html");
    } else{
        res.redirect('/login');
    }
})

app.get('/sales', function(req, res){
    console.log("sales page");
    if(globalID){
    res.sendFile(__dirname + "/Views/html/sales1.html");
    } else{
        res.redirect('/login');
    }
})
app.get('/service', function(req, res){
    console.log("service page");
    if(globalID){
        res.sendFile(__dirname + "/Views/html/service.html");
    } else{
        res.redirect('/login');
    }
})