import express from "express";
import {
  createOrUpdateAboutPage,
  createOrUpdateContactPage,
  createOrUpdateHomePage,
  createOrUpdateSocialLinks,
  createTemplate,
  getaboutpage,
  getcontactpage,
  gethomepage,
} from "../../controllers/vendor-template/templateBase.controller.js";

const router = express.Router();

/* ------------ Template CRUD ------------ */
router.post("/", createTemplate);
router.put("/home", createOrUpdateHomePage);
router.put("/about", createOrUpdateAboutPage);
router.put("/contact", createOrUpdateContactPage);
router.put("/:templateId/social", createOrUpdateSocialLinks);
router.get("/homepage", gethomepage);
router.get("/contactpage", getcontactpage);
router.get("/aboutpage", getaboutpage);

export default router;
