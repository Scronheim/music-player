const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AllSchema = new Schema({
    artist: String,
    country: String,
    albums:
        [
        {
            title: String,
            year: Number,
            genre: String,
            cover: String,
            mbid: '',
            tracks: [
                {
                    number: Number,
                    title: String,
                    filepath: String
                }
            ]
        }
    ],
    mbid: String
}, {versionKey: false});
const AllModel = mongoose.model('all', AllSchema, 'all');
module.exports = AllModel;
