import mongoose from "mongoose";

const componentSchema = new mongoose.Schema({
  logo: {
    type: String,
    required: true,
  },
  home_page: {
    header_text: {
      type: String,
      required: true,
    },
    header_text_small: {
      type: String,
      required: true,
    },
    button_header: {
      type: String,
    },
    description: {
      large_text: { type: String },
      summary: { text: String },
      percent: {
        percent_in_number: {
          type: String,
        },
        percent_text: {
          type: String,
        },
      },
      sold: {
        sold_number: {
          type: String,
        },
        sold_text: {
          type: String,
        },
      },
    },
  },

  about_page: {
    about_heading: {
      type: String,
    },
    mission: {
      mission_text: {
        type: String,
      },
      mission_points: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
  },
});

const templateBaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    previewImage: String,
    components: [componentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("TemplateBase", templateBaseSchema);
