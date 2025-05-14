require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');


const { MongoClient, ServerApiVersion } = require('mongodb');

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



app.get('/', (req, res) => {
  res.render("index.ejs");
});

app.get('/placeOrder', (req, res) =>  {  // add code to store the info from the place order form into the database 
    res.render("placeOrder.ejs");
});

app.get('/orderConfirmation', (req, res) =>  { // edit this one to POST and retrieve information from the database
    res.render("confirmation.ejs");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});