import express from "express";
import {
  createTemplate,
  getaboutpage,
  getcontactpage,
  gethomepage,
} from "../../controllers/vendor-template/templateBase.controller.js";

const router = express.Router();

/* ------------ Template CRUD ------------ */
router.post("/", createTemplate);
router.get("/homepage", gethomepage);
router.get("/contactpage", getcontactpage);
router.get("/aboutpage", getaboutpage);

export default router;
