import mongoose from 'mongoose';

const { Schema } = mongoose;

const musicSchema = new Schema({
    name: {type: String, required: true, maxLength: 100},
    album: {type: String, required: true, maxLength: 100},
    artist: {type: String, required: true, maxLength: 100}
}, {
    toJSON: {virtuals: true}
})

musicSchema.virtual('_links').get(
    function () {
        return {
            self: {
                href: `${process.env.BASE_URI}/music/${this.id}`
            },
            collection: {
                href: `${process.env.BASE_URI}/music`
            }
        }
    }
);

export default mongoose.model('Music', musicSchema);