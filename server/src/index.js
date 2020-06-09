const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const mongoose = require('mongoose');
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());
const Tracks = require('./models/tracks');

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
    Tracks.find({}, (err, tracks) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({tracks: tracks })
        }
    }).sort({ _id: -1 });
});
