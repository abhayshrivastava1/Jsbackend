import mongoose, {Schema} from "mongoose";

const videoSchema = new Schema(
  {
    videoFIle: {
      type: String,
      required: true,
      thumbnail,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // cloudenaryurl
      required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Booleanl,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
    
  },
  { timestamps: true }
);



export const Video = mongoose.model("Video", videoSchema)