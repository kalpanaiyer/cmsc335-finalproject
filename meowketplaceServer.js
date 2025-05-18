require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const request = require('request');
const router = express.Router();



const { MongoClient, ServerApiVersion, MongoGCPError } = require('mongodb');

const uri = process.env.MONGO_CONNECTION_STRING;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const db = "CMSC335FINALPROJ";
let collectionName = "meowketplace";
let mongoCollection;

async function connectToMongo() {
  try {
    await client.connect();
    mongoCollection = client.db(db).collection(collectionName);
  } catch (e) {
    console.error(e);
  }
}

connectToMongo();


const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set("views", path.resolve(__dirname, "templates"));
app.use(express.static(path.join(__dirname, 'public')));



router.get('/', (req, res) => {
  res.render("index");
});

router.get('/placeOrder', (req, res) =>  {  
  res.render("placeOrder");
});

app.post('/confirmation', async (req, res) => {
  const { fullname, email, number, toys, items } = req.body;

  try {
    await mongoCollection.insertOne({
      fullname,
      email,
      number,
      toys,
      items,
      createdAt: new Date()
    });
    console.log('Order saved to database');
  } catch (insertErr) {
    console.error('Failed to save order:', insertErr);
  }
  
  const options = {
    method: 'GET',
    url: 'https://catfact.ninja/fact?max_length=140',
    headers: {
      'Accept': 'application/json'
    }
  };

  request(options, (error, response) => {
    if (error) {
      console.error('Error fetching cat fact:', error);
      return res.status(500).send('Error fetching cat fact');
    }

    try {
      const data = JSON.parse(response.body);
      const catFact = data.fact;  

      res.render('confirmation', {
        fullname,
        email,
        number,
        toys,
        items,
        fact: catFact  
      });
    } catch (parseError) {
      console.error('Error parsing cat fact response:', parseError);
    }
  });
});

router.get('/viewAllOrders', async (req, res) => { // using express.router requirement
  try {
    const orders = await mongoCollection.find().toArray();
    res.render('viewAllOrders', { orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Error retrieving orders');
  }
});


app.use('/', router);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});