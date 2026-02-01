    import mongoose, {Schema} from 'mongoose';
    import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
    

    const videoSchema = new mongoose.Schema({
        videofilename: { type: String, required: true, unique: true },
        title: { type: String, required: true, index: true, trim: true },///cloudinary public id
        description: { type: String, required: true, trim: true },//cloudinary public id
        url: { type: String, required: true },//cloudinary url
        thumbnailUrl: { type: String, default: "" },
        duration: { type: Number, required: true }, // duration in seconds(from cloudinary metadata)
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        tags: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now }
    }, {
        timestamps: true
    });

    export const Video = mongoose.model("Video", videoSchema);  