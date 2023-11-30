const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken'); 
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT;
const router = express.Router();

// Middleware to parse the body of requests in JSON format
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencode
app.use(express.json()); // application/json
// app.use(express.static("./Views/lib"));
app.use(express.static(path.join(__dirname, 'Views')));
app.use('/', router);

app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: true,
}));

// ejs
app.set('view engine', 'ejs'); //view engine이 사용할 Template Engine
app.set('views', __dirname + '/Views');

// conection to MongoDB
const url = process.env.MONGO_URL;

async function connect(){
    try{
        await mongoose.connect(url);
        console.log("Connected Succesfully...");
    }catch(error){
        console.log(error);
    }
}

connect();

const { Product } = require('./Models/Product'); // importing product
const { User } = require('./Models/User'); //importing user
const { Discount } = require('./Models/Discount'); //importing user

app.post('/register', async (req, res) => {
    try {
        const { ID, password, name, role } = req.body;
      
        // verify if the user already exists
        const existingUser = await User.findOne({ ID });
        if (existingUser) {
            return res.status(400).json({ error: 'ID already in use' });
        }
  
        // create a new user
        const newUser = new User({ ID, password, name, role });
  
        // saving user
        //await newUser.save();
  
        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Error in registering the user: ${error.message}` });
    }
});

// Path to login
app.post('/login', async (req, res) => {
    try {
        const { ID, password } = req.body;
        
        if(req.session.user) {
            res.redirect('/Views/html/inter.html');
        } else {
            // Search the user by ID
            const user = await User.findOne({ ID });

            // Check if the user exists and the password is correct
            if (user && user.password === password) {
                // generate token --> in any case if we need like to check that it is the admin I guess so he can edit the products
                //FIGURE IT OUT LATER
                const token = jwt.sign({ userId: user._id, ID: user.ID }, 'secret_key', { expiresIn: '1h' });

                // give the token to the user
                res.json({ token });
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
        res.status(500).json({ error: 'Error the product could not be added' });
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
        res.status(500).json({ error: 'Error at deleting product' });
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
        res.status(500).json({ error: 'Error at updating product' });
    }
});
//curl -X PUT -H "Content-Type: application/json" -d '{"newName": "사과", "newPrice": 1000}' http://localhost:8000/products/name/apple   

// Path to add a new discount
app.post('/discount', async (req, res) => {
    try {
        console.log(req.body);
        // Create a new document using the Product model
        const newDiscount = new Discount(
        req.body
        );
        console.log(req.body);
        // Save the new product to the database
        const result = await newDiscount.save();

        res.json(result); // Return the result as JSON
    } catch (error) {
        res.status(500).json({ error: 'Error the discount could not be added' });
    }
});
//curl -X POST -H "Content-Type: application/json" -d '{"name": "고기", "price": 5000}' http://localhost:8000/products

app.delete('/discount/name/:productName', async (req, res) => {
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

// Path to get all products
app.get('/discount', async (req, res) => {
    try {
        const discount = await Discount.find({});

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
app.get('/login', function(req, res){
    console.log("index page");
    res.sendFile(__dirname + "/Views/html/main.html");
})

app.get('/business', function(req, res){
    console.log("business page");
    res.sendFile(__dirname + "/Views/html/business.html");
})

app.get('/sales', function(req, res){
    console.log("sales page");
    res.sendFile(__dirname + "/Views/html/sales.html");
})
app.get('/service', function(req, res){
    console.log("service page");
    res.sendFile(__dirname + "/Views/html/service.html");
})