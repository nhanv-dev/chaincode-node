const network = require("./fabric/network.js")

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT || 8081;

app.get('/initLedger', (req, res) => {
    console.log('initLedger')
    network.initLedger()
        .then(response => {
            res.send(response);
        })
})

app.get('/queryAllCars', (req, res) => {
    console.log('queryAllCars')
    network.queryAllCars()
        .then(response => {
            res.send(response);
        })
})


app.get('/querySingleCar', (req, res) => {
    console.log(req.query.key);
    console.log('querySingleCar')
    network.querySingleCar(req.query.key)
        .then((response) => {
            res.send(response);
        });
})

app.listen(PORT, function () {
    console.log('Server Listening ', PORT)
});
