import mongoose from "mongoose";

/* ------------------ CONTACT PAGE ------------------ */



const section_2Schema = new mongoose.Schema({
  hero_title: { type: String },
  hero_subtitle: { type: String },
  hero_title2: { type: String },
  hero_subtitle2: { type: String },
  lat: { type: String },
  long: { type: String },
});
const contactHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
});
const contactPageSchema = new mongoose.Schema({
  hero: contactHeroSchema,
  section_2: section_2Schema,
});

/* ------------------ ABOUT PAGE ------------------ */
const aboutHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true, default: "" },
  title: { type: String, required: true, default: "" },
  subtitle: { type: String, required: true, default: "" },
});

const storySectionSchema = new mongoose.Schema({
  // Removed 'heading' since frontend doesn't provide it
  paragraphs: [{ type: String, default: "" }],
  image: { type: String, default: "" },
});

const valueSchema = new mongoose.Schema({
  icon: { type: String, default: "" },
  title: { type: String, required: true, default: "" },
  description: { type: String, required: true, default: "" },
});

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, default: "" },
  role: { type: String, required: true, default: "" },
  image: { type: String, default: "" },
});

const statSchema = new mongoose.Schema({
  value: { type: String, required: true, default: "" },
  label: { type: String, required: true, default: "" },
});

const aboutPageSchema = new mongoose.Schema({
  hero: { type: aboutHeroSchema, required: true },
  story: { type: storySectionSchema, required: true },
  values: [valueSchema],
  team: [teamMemberSchema],
  stats: [statSchema],
});

/* ------------------ HOME PAGE ------------------ */
const percentSchema = new mongoose.Schema({
  percent_in_number: { type: String },
  percent_text: { type: String },
});

const soldSchema = new mongoose.Schema({
  sold_number: { type: String },
  sold_text: { type: String },
});

const descriptionSchema = new mongoose.Schema({
  large_text: { type: String },
  summary: { type: String },
  percent: percentSchema,
  sold: soldSchema,
});

const homePageSchema = new mongoose.Schema({
  header_text: { type: String, required: true },
  header_text_small: { type: String, required: true },
  button_header: { type: String },
  description: descriptionSchema,
});

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const faqSectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  subheading: { type: String },
  faqs: [faqSchema],
});


const socialPageSchema = new mongoose.Schema({
  facebook: { type: String },
  instagram: { type: String },
  whatsapp: { type: String },
  twitter: { type: String },
  faqs: faqSectionSchema,
});
/* ------------------ TEMPLATE BASE ------------------ */
const componentSchema = new mongoose.Schema({
  logo: { type: String },
  home_page: homePageSchema,
  about_page: aboutPageSchema,
  contact_page: contactPageSchema,
  social_page: socialPageSchema,
});

const templateBaseSchema = new mongoose.Schema(
  {
    vendor_id: { type: String },
    previewImage: { type: String },
    components: componentSchema,
  },
  { timestamps: true }
);

export const TemplateBase = mongoose.model("TemplateBase", templateBaseSchema);
