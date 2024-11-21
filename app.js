const express = require("express");
const connectDB = require("./connectToDatabase");
let Product = require("./model/Product");
let Cart = require('./model/Cart')
let User = require("./model/User.js")
let jwt = require("jsonwebtoken")
let bcrypt = require("bcrypt")
// let axios = require("axios")



const app = express();
connectDB();

// middlewares
app.use(express.json())



app.get("/", async (req, res) => {
    res.send("ShoppyGlobe backend")
    // try {

    //     let products = await Product.find();
    //     res.status(200).send(products)

    // }
    // catch(err) {
    //     res.status(404).send(err);
    // }



    // used only once to push data to database
    // try {
    //     const response = await axios.get("https://dummyjson.com/products");
    //     const products = response.data.products;
    //     await Product.create(products);
    //     console.log("Data successfully inserted!");
    // } catch (error) {
    //     console.log(error);
    // }
})


app.get("/products", async (req, res) => {
    try {

        let products = await Product.find();
        res.status(200).json(products)

    }
    catch (err) {
        res.status(500).json({ error: err });
    }
})

app.get('/products/:id', async (req, res) => {
    // the id should be of Schema.types.ObjectId
    let id = req.params.id;
    try {
        let product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'No product found...' });
            return;
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong server side...' });
    }
});


app.get("/cart", authenticateUser, async (req, res) => {
    // this  route implementation is not required in the assignment
    // this router is not fully functioning
    // we will iterate over the cartItems and one by one get productById fill in array n return
    // return to client
    let userId = req.user.id;
    try {

        let cartItems = await Cart.find({userId})
        res.status(200).json(cartItems)

    }
    catch (err) {
        res.status(500).json({ error: err });
    }
})


app.post('/cart', authenticateUser, async (req, res) => {
    // console.log("inside post route after authenticateUser")
    let { productId, quantity } = req.body;
    let userId = req.user.id;

    // console.log("doing validation");
    if (!productId || !quantity) {
        res.status(400).json({ error: "Some of the required field is missing..." });
        return;
    }


    try {
        let product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found...' });
            return;
        }

        if (quantity > product.stock) {
            return res.status(400).send("Low in stock....")
        }

        let cartItem = await Cart.findOne({ userId, productId })
        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
            console.log(userId);
            res.status(200).json({ message: "Cart updated", cartItem });  
        }
        else {
            console.log(userId);
            cartItem = new Cart({ productId, userId, quantity });
            await cartItem.save();
            res.status(201).json(cartItem);
        }

    } catch (err) {
        res.status(500).json({ message: 'Something went wrong server side...' });
    }
});


// update the quantity of carItem
app.put('/cart/:id', authenticateUser, async (req, res) => {
    let {quantity} = req.body;
    // console.log("typeof quantity-->", typeof quantity)
    let userId = req.user.id;
    let id = req.params.id; // this is productId
    // console.log("id->", id);
    // console.log("userId->", userId);
    
    if(!quantity || quantity <= 0) {
        res.status(400).send("Quantity must be positive...")
        return ;
    }

    try {
        const cartItem = await Cart.findOne({ _id: id, userId });
        if (!cartItem) {
            res.status(404).json({ message: 'Item with id and userId not found...' });
            return;
        }

        // it's better to check for availability of item in stock before incrementing quantity but lets see
        cartItem.quantity = quantity;
        await cartItem.save();
        console.log("logging...")

        console.log("Item quantity updated successfully...")
        res.json(cartItem);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong server side...' });
    }
});


app.delete('/cart/:id', authenticateUser, async (req, res) => {
    let id = req.params.id;
    let userId = req.user.id;
    console.log("id->", id);
    console.log("userId->", userId);
    
    try {
        const cartItem = await Cart.findOneAndDelete({_id: id, userId});
        if (!cartItem) {
            res.status(404).json({ message: 'No item found to delete...' });
            return;
        }
        res.json({ message: 'Cart item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong server side...' });
    }
});


app.post("/login", async (req, res) => {
    let { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Email and password both required...")
        return;
    }


    try {

        // finding saved user by email
        let user = await User.findOne({ email })

        if (!user) {
            res.status(401).send("User with email or password not found...")
            return;
        }

        // check password is correct or not 
        let isValidPassword = await bcrypt.compare(password, user.password); // check one more
        if (!isValidPassword) {
            res.status(401).send("Invalid email or password...");
            return;
        }

        // generate token
        let token = jwt.sign({ // check once more
            email: user.email
        }, "secretKey")

        // return token
        res.json({
            token
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal Server error");
    }
})


app.post("/register", async (req, res) => {

    let { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
        res.status(400).send("Either one or more required fields are missing...")
        return;
    }

    try {

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(409).send("Email already registered...");
            return;
        }

        let hashedPassword = await bcrypt.hash(password, 10); // check once more
        const newUser = new User({
            username,
            name,
            email,
            password: hashedPassword
        })

        await newUser.save();

        let token = jwt.sign(newUser, "secretKey")

        res.json({
            token, user: {
                username: newUser.username,
                email: newUser.email
            }
        })

    }
    catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }
})


function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    jwt.verify(token, "secretKey", async (err, user) => {
        if (err) {
            res.status(403).send("Invalid JWT token...");
            return;
        }

        let email = user.email;
        let existingUser = await User.findOne({email})
        req.user = existingUser;
        // console.log("user-->", existingUser.id);
        next();
    })
}







let PORT = 3000;
app.listen(PORT, (req, res) => {
    console.log("Listening on port 3000")
})