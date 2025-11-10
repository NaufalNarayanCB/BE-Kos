import express from "express"
import { getAllKos, createKos, updateKos, deleteKos } from "../controllers/kosControllers"
import { verifCreateKos, verifEditKos } from "../middlewares/kosVerif"
import { verifToken, verifRole } from "../middlewares/authorization"
import { json } from "stream/consumers"
import { get } from "http"
//import uploadFile from "../middlewares/kosUpload"


const app = express()
app.use(express.json())

app.get("/", getAllKos)
app.post("/add", [verifToken, verifRole(["OWNER"]),verifCreateKos], createKos)
app.put("/edit/:id", [verifToken, verifRole(["OWNER"]), verifEditKos], updateKos)
app.delete("/delete/:id", [verifToken, verifRole(["OWNER"])], deleteKos)

export default app