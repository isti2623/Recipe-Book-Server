const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { query } = require('express');
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileupload');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({ limit: '50mb' }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sovrt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });




async function run() {
    try {
        await client.connect();
        const database = client.db('recipe-book');
        const recipePostReqCollection = database.collection('recipePostReq');
        const MyFavourites = database.collection('favourites');



        // GET favourites
        app.get('/favourites', async (req, res) => {
            const cursor = MyFavourites.find({});
            const favourites = await cursor.toArray();
            res.send(favourites);
        });

        // single favourite
        app.get('/favourite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const favourite = await MyFavourites.findOne(query);
            // console.log('load user with id: ', id);
            res.send(favourite);
        })



        // GET all favourite by email
        app.get("/myFavourites/:email", (req, res) => {
            console.log(req.params);
            MyFavourites
                .find({ email: req.params.email })
                .toArray((err, results) => {
                    res.send(results);
                });
        });

        //DELETE my favourite
        app.delete('/myFavourites/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await MyFavourites.deleteOne(query);
            res.json(result);
        })

        // POST favourites
        app.post('/favourites', async (req, res) => {
            const favourite = req.body;
            console.log('hit the post api', favourite);
            const result = await MyFavourites.insertOne(favourite);
            console.log(result);
            res.json(result)
        });


        //Recipe Get Api
        app.get('/recipePostReq', async (req, res) => {
            const cursor = recipePostReqCollection.find({});
            const recipePostReq = await cursor.toArray();
            res.send(recipePostReq);
        })


        //Recipe Single 
        app.get('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const user = await recipePostReqCollection.findOne(query);
            // console.log('load user with id: ', id);
            res.send(user);
        })


        //Recipe DELETE Api
        app.delete('/recipePostReq/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await recipePostReqCollection.deleteOne(query);
            res.send(result);
        })

        //Recipe PUT Api
        app.put('/recipePostReq/:id', async (req, res) => {
            const id = req.params.id;
            const recipeName = req.body.recipeName;
            const cuisine = req.body.cuisine;
            const category = req.body.category;
            const author = req.body.author;
            const ingredients = req.body.ingredients;
            const method = req.body.method;

            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    recipeName: recipeName,
                    cuisine: cuisine,
                    category: category,
                    author: author,
                    ingredients: ingredients,
                    ingredients: ingredients,
                    method: method,
                    image: imageBuffer,
                },
            };
            const result = await recipePostReqCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result);


        });


        //Recipe POST Api

        app.post('/recipePostReq', async (req, res) => {
            const recipeName = req.body.recipeName;

            const cuisine = req.body.cuisine;
            const category = req.body.category;
            const author = req.body.author;
            const ingredients = req.body.ingredients;
            const method = req.body.method;

            const pic = req.files.image;
            const picData = pic.data;
            const encodedPic = picData.toString('base64');
            const imageBuffer = Buffer.from(encodedPic, 'base64');
            const food = {
                recipeName,
                cuisine,
                category,
                author,
                ingredients,
                method,
                image: imageBuffer
            }


            const result = await recipePostReqCollection.insertOne(food);
            console.log('post', req.body.recipeName);
            res.json(result);
            console.log('recipi hit');
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Recipe Book!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})