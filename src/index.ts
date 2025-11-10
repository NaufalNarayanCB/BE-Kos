import express from 'express'
import userRoutes from './routes/userRoutes'
import kosRoutes from './routes/kosRoutes'
import fasilitasRoutes from './routes/fasilitasRoutes'
import bookRoutes from './routes/bookRoutes'
import reviewRoutes from './routes/reviewRoutes'

const app = express()

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.json())
app.use('/user', userRoutes)
app.use('/kos', kosRoutes)
app.use('/fasilitas', fasilitasRoutes)
app.use('/book', bookRoutes)
app.use('/review', reviewRoutes)

export default app;
const PORT = 8000

app.listen(PORT, () => {
  console.log(`[server]: Server running on http://localhost:${PORT}`)
})
