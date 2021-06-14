const Task = require('../models/task')
const express = require('express')

const auth = require('../middlewares/auth')

const taskRouter = new express.Router()








taskRouter.post('/task',auth, async (req,res)=>{

    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner:req.user._id,
    })

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){

        res.status(400).send('Failed to save!')
        res.send(e)
    }

})






taskRouter.get('/tasks',auth, async (req,res)=>{
    
    const match = {}
    if(req.query.completed){
        
        match.completed = req.query.completed === 'true'
    }

    const sort={}

    if(req.query.sortBy){

        const parts = req.query.sortBy.split(':')
        sort[parts[0]]=parts[1] === 'desc'?-1:1

    }
    
    try{
        await req.user.populate({

            path: 'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }

        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send(e)

    }
    
})

taskRouter.get('/tasks/:id',auth, async(req,res)=>{
    const _id = req.params.id

    try{
        //const tasks = await Task.findById(taskId)

        const tasks = await Task.findOne({_id, owner: req.user._id})
        if(!tasks){
            return res.status(404).send('Data not found..')
        }
        res.status(200).send(tasks)

    }catch(e){
        res.status(500).send(e)
    }
})




taskRouter.patch('/tasks/:id',auth, async (req,res)=>{

    const allowedUpdates = ["description","completed"]
    const requestedUpdates = Object.keys(req.body)

    const isUpdateValidate = requestedUpdates.every((update)=>{
        return allowedUpdates.includes(update)
    })

    if(!isUpdateValidate){
        return res.status(400).send({"error":"Invalid update"})
    }

    try{

        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        
        //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true, runValidators:true})
        if(!task){
            return res.status(404).send()
        }

        requestedUpdates.forEach((update) =>{
            return task[update]=req.body[update]
        })
        await task.save()

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }



})





taskRouter.delete('/tasks/:id',auth,  async (req, res)=>{

    try{
        const task = await Task.findOneAndDelete({_id:req.params.id, owner:req.user._id})
        if(!task){
            return res.status(404).send({"error":"task doesn't exist"})
        }
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})



module.exports = taskRouter