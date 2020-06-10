const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const mongoose = require('mongoose');
const AllModel = require('./models/all');
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb://localhost/music?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connection
    .once('open', () => {
        console.log(`Mongoose - successful connection ...`);
        app.listen(process.env.PORT || config.port,
            () => console.log(`Server start on port ${config.port} ...`))
    })
    .on('error', error => console.warn(error));

app.get('/all', (req, res) => {
    AllModel.find({}, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    }).sort({ _id: -1 });
});
