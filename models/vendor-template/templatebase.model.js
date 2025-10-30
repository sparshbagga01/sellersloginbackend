import mongoose from "mongoose";

/* ------------------ CONTACT PAGE ------------------ */
const contactHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
});

const contactInfoSchema = new mongoose.Schema({
  icon: { type: String },
  title: { type: String, required: true },
  details: { type: String, required: true },
});

const formFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: "text" },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
});

const contactFormSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String },
  fields: [formFieldSchema],
  submitButtonText: { type: String, default: "Send Message" },
});

const visitInfoSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String },
  mapImage: { type: String },
  reasonsHeading: { type: String },
  reasonsList: [{ type: String }],
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

const contactPageSchema = new mongoose.Schema({
  hero: contactHeroSchema,
  contactInfo: [contactInfoSchema],
  contactForm: contactFormSchema,
  visitInfo: visitInfoSchema,
  faqSection: faqSectionSchema,
});

/* ------------------ ABOUT PAGE ------------------ */
const aboutHeroSchema = new mongoose.Schema({
  backgroundImage: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
});

const storySectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  paragraphs: [{ type: String }],
  image: { type: String },
});

const valueSchema = new mongoose.Schema({
  icon: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  image: { type: String },
});

const statSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true },
});

const aboutPageSchema = new mongoose.Schema({
  hero: aboutHeroSchema,
  story: storySectionSchema,
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

/* ------------------ TEMPLATE BASE ------------------ */
const componentSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  home_page: homePageSchema,
  about_page: aboutPageSchema,
  contact_page: contactPageSchema,
});

const templateBaseSchema = new mongoose.Schema(
  {
    vendor_id: { type: String },
    name: { type: String, required: true },
    previewImage: { type: String },
    components: componentSchema,
  },
  { timestamps: true }
);

export const TemplateBase = mongoose.model("TemplateBase", templateBaseSchema);
