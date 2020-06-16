const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LikeSchema = new Schema({
    artist: String,
    album: String,
    title: String,
    number: Number,
    filepath: String,
    year: Number,
    cover: String,
    genre: String
}, {versionKey: false});
const AllModel = mongoose.model('liked_tracks', LikeSchema, 'liked_tracks');
module.exports = AllModel;
