const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 8000;


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
const url = 'mongodb+srv://admin_pos:admin_pos@pos.tsl6d4z.mongodb.net/POS_hanyang?retryWrites=true&w=majority';

async function connect(){
    try{
        await mongoose.connect(url);
        console.log("Connected Succesfully...");
    }catch(error){
        console.log(error);
    }
}

connect();

// // Define the schema of the "products" collection
// const productSchema = new mongoose.Schema({
//     name: String,
//     price: Number,
// });

// const Product = mongoose.model('Products', productSchema);

const { Product } = require('./Models/Product'); // 1. 지난 번 만들어 두었던 Product.js(스키마) 임포트


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
    // Product.find({}).then((data)=>{
    //     // EJS 템플릿 렌더링
    //     // console.log("table 읽기 성공");
    //     // console.log(data);
    //     res.render('./html/business copy 2', { products: data });
    // }).catch((err)=>{
    //     console.log(err);
    // });
    res.sendFile(__dirname + "/Views/html/business.html");
})