import express  from "express";
import { createReview, deleteReview, getReviewsByKos, updateReview, replyReview } from "../controllers/reviewControllers";
import { verifyCreateReview, verifyEditReview, verifyReplyReview } from "../middlewares/reviewValidation";
import { verifRole, verifToken } from "../middlewares/authorization";

const app = express();

app.get("/:kosId", getReviewsByKos);
app.post("/", verifToken, verifRole(["SOCIETY"]), ...verifyCreateReview, createReview);
app.post("/reply/:id", verifToken, verifRole(["OWNER"]), ...verifyReplyReview,replyReview);
app.put(`/edit/:id`, verifToken, verifRole(["SOCIETY"]), ...verifyEditReview, updateReview);
app.delete("/:id", verifToken, deleteReview);

export default app;