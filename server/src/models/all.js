const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AllSchema = new Schema({
    group: String,
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
                    duration: String,
                    filepath: String
                }
            ]
        }
    ]
});
const AllModel = mongoose.model('all', AllSchema, 'all');
module.exports = AllModel;
