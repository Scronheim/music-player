const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TracksSchema = new Schema({
    artist: {
        type: String,
    },
    track: {
        type: String
    },
    genre: {
        type: String
    }
});
const TrackModel = mongoose.model('tracks', TracksSchema);
module.exports = TrackModel;
