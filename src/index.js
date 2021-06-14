const express = require('express')


const userRouter = require('./routers/userRouter')
const taskRouter = require('./routers/taskRouter')
require('./db/mongoose')
const app = express()



const port = process.env.PORT
//Because of this line , all the request will be in JSON 
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)







app.listen(port, ()=>{
    console.log('Server is Up.. on port ',port)
})
