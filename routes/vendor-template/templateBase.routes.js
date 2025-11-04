import express from "express";
import {
  createOrUpdateAboutPage,
  createOrUpdateContactPage,
  createOrUpdateHomePage,
  createOrUpdateSocialLinksandFaqs,
  createTemplate,
  getaboutpage,
  getalltemplatedata,
  getcontactpage,
  gethomepage,
} from "../../controllers/vendor-template/templateBase.controller.js";

const router = express.Router();

/* ------------ Template CRUD ------------ */
router.post("/", createTemplate);
router.put("/home", createOrUpdateHomePage);
router.put("/about", createOrUpdateAboutPage);
router.put("/contact", createOrUpdateContactPage);
router.put("/social-faqs", createOrUpdateSocialLinksandFaqs);
router.get('/template-all',getalltemplatedata)
router.get("/homepage", gethomepage);
router.get("/contactpage", getcontactpage);
router.get("/aboutpage", getaboutpage);

export default router;
