import express from "express";
import { getAllUser, createUser, authorization, register, deleteUser, editUser } from "../controllers/userControllers"
import { verifCreateUser, verifAuth, verifEditUser } from '../middlewares/userVerif'
import { verifRole, verifToken } from '../middlewares/authorization'

const app = express()
app.use(express.json())

app.get('/', getAllUser)
app.post('/regis', [verifCreateUser], register)
app.post('/login', [verifAuth], authorization)
app.put('/:id', [verifToken, verifRole(["SOCIETY", `OWNER`]), verifEditUser], editUser)
app.delete('/:id', [verifToken, verifRole(["OWNER"])], deleteUser)

export default app