const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const mongoose = require('mongoose');
const AllModel = require('./models/all');
const LikeModel = require('./models/liked');
const formidable = require('formidable');
const unrar = require('unrar');
const fs = require('fs');

const app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(cors());

const uri = "mongodb://localhost/music?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true});
mongoose.connection
    .once('open', () => {
        console.log(`Mongoose - successful connection ...`);
        app.listen(process.env.PORT || config.port,
            () => console.log(`Server start on port ${config.port} ...`))
    })
    .on('error', error => console.warn(error));

const uploadMedia = (req, res) => {
    const form = formidable({
        keepExtensions: true
    });
    form.parse(req, (err, fields, files) => {
        let archive = new unrar(files.file.path);
        archive.list(function(err, entries) {
            if (err) console.log(err);
            let tmpDir = 'E:\\123\\';
            for (let i = 0; i < entries.length; i++) {
                let name = entries[i].name;
                let type = entries[i].type;
                if (type !== 'File') {
                    fs.mkdirSync(tmpDir+name)
                }
            }
            for (let i = 0; i < entries.length; i++) {
                let name = entries[i].name;
                let type = entries[i].type;
                if (type !== 'File') {
                    continue;
                }

                let stream = archive.stream(name);
                fs.writeFileSync(tmpDir+name, stream);
            }
        });
        res.send({fields, files})
    })
};


app.get('/all', (req, res) => {
    AllModel.find({}, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    }).sort({ artist: 1 });
});

app.patch('/saveData', (req, res) => {
    AllModel.updateOne({_id: req.body._id}, req.body, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    });
});

app.get('/liked', (req, res) => {
    LikeModel.find({}, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    }).sort({ _id: -1 });
});

app.post('/liked', (req, res) => {
    LikeModel.findOneAndUpdate({filepath: req.body.filepath}, req.body, {upsert: true}, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    });
});

app.delete('/liked', (req, res) => {
    LikeModel.deleteOne({filepath: req.query.file}, (err, results) => {
        AllModel.updateOne({'albums.tracks.filepath': req.query.file},
            {$set: {'albums.$.tracks.$[track].liked': false}}, {arrayFilters: [{'track.filepath': req.query.file}]}, (err, results) => {
            if (err) res.sendStatus(500)
            else res.sendStatus(200);
        });
    });
});

app.post('/addData', (req, res) => {
    AllModel.findOneAndUpdate({artist: req.body.artist}, req.body, {upsert: true}, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    });
});

app.post('/upload', uploadMedia);

app.patch('/playCounts', (req, res) => {
    AllModel.updateOne({_id: req.body._id}, req.body, (err, results) => {
        if (err) {
            res.sendStatus(500)
        } else {
            res.send({data: results })
        }
    });
});
