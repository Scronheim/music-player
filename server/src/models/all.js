const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AllSchema = new Schema({
    group: String,
    albums:
        [
        {
            name: String,
            year: Number,
            genre: String,
            cover: String,
            tracks: [
                {
                    number: Number,
                    name: String,
                    duration: String,
                    filepath: String
                }
            ]
        }
    ]
});
const AllModel = mongoose.model('all', AllSchema, 'all');
module.exports = AllModel;
