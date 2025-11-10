import express from "express"
import { getAllBook, getBookHistory, createBook, updateBook, deleteBook, getBookReceipt } from "../controllers/bookControllers"
import { verifyCreateBook, verifyEditBook } from "../middlewares/bookValidation"
import { verifToken, verifRole } from "../middlewares/authorization"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get(`/`, getAllBook) 
app.get(`/history`, [verifToken, verifRole(["OWNER"])], getBookHistory)
app.get("/receipt/pdf/:id", [verifToken, verifRole(["SOCIETY"])], getBookReceipt);
app.post(`/create`, [verifToken, verifRole(["SOCIETY"]), ...verifyCreateBook], createBook)
app.put(`/:id`, [verifToken, verifRole(["SOCIETY", "OWNER"]), ...verifyEditBook], updateBook)
app.delete(`/:id`, [verifToken, verifRole(["SOCIETY"])], deleteBook)

export default app