const network = require("./fabric/network.js")

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8081;

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

app.get('/initLedger', (req, res) => {
    network.initLedger()
        .then(response => {
            res.send(response);
        })
})

app.get('/queryAllCars', (req, res) => {
    network.queryAllCars()
        .then(response => {
            res.send(response);
        })
})

app.get('/querySingleCar', (req, res) => {
    network.querySingleCar(req.query.key)
        .then((response) => {
            res.send(response);
        });
})

app.post('/insertCar', (req, res) => {
    const { key, color, size, owner } = req.body;
    console.log(req.body);
    network.insertCar(key, color, size, owner)
        .then((response) => {
            res.send(response);
        });
})

app.put('/updateCar', (req, res) => {
    const { key, color, size, owner } = req.body;
    network.updateCar(key, color, size, owner)
        .then((response) => {
            res.send(response);
        });
})

app.listen(PORT, function () {
    console.log('Server is listening ', PORT)
});
