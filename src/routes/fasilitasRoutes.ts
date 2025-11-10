import express from "express";

import {getAllFacility, createFacility, updateFacility, deleteFacility, getFacilityByKosId} from "../controllers/fasilitasControllers";
import { verifyAddFacility, verifyEditFacility } from "../middlewares/fasilitasVerif";
import { verifToken, verifRole } from "../middlewares/authorization";

const app = express();

app.get("/", getAllFacility);
app.get("/:kosId", getFacilityByKosId);
app.post("/create", [verifToken, verifRole(["OWNER"]), ...verifyAddFacility], createFacility);
app.put("/:id", [verifToken, verifRole(["OWNER"]), ...verifyEditFacility], updateFacility);
app.delete("/:id", [verifToken, verifRole(["OWNER"])], deleteFacility);

export default app;