import express from "express"
import { getAllKos, createKos, updateKos, deleteKos } from "../controllers/kosControllers"
import { verifCreateKos, verifEditKos } from "../middlewares/kosVerif"
import { verifToken, verifRole } from "../middlewares/authorization"
import { json } from "stream/consumers"
import { get } from "http"
import uploadKosFile from "../middlewares/kosImage"
import { addKosImage, deleteKosImage } from "../controllers/KosImageControllers"
//import uploadFile from "../middlewares/kosUpload"


const app = express()
app.use(express.json())

app.get("/", getAllKos)
app.post("/add", [verifToken, verifRole(["OWNER"]),verifCreateKos], createKos)
app.put("/edit/:id", [verifToken, verifRole(["OWNER"]), verifEditKos], updateKos)
app.delete("/delete/:id", [verifToken, verifRole(["OWNER"])], deleteKos)

/**
 * @swagger
 * /kos-images:
 *   post:
 *     summary: Add image to kos (owner only)
 */
app.post("/image/:kos_id", [verifToken, verifRole(["OWNER"]), uploadKosFile.single("file")], addKosImage)

/**
 * @swagger
 * /kos-images/{id}:
 *   delete:
 *     summary: Delete kos image (owner only)
 */
app.delete("/delete_image/:id", [verifToken, verifRole(["OWNER"])], deleteKosImage)

export default app