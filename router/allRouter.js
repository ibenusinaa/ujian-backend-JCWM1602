const express = require('express')
const Router = express.Router()


const allController = require('./../controller/allController')

const jwtVerify = require('./../middleware/JWT')

Router.post('/user/register', allController.register)
Router.post('/user/login', allController.login)
Router.patch('/user/deactive', jwtVerify, allController.deactive)
Router.patch('/user/activate', jwtVerify, allController.activate)
Router.patch('/user/close', jwtVerify, allController.close)
Router.get('/movies/get/all', allController.getAllMovies)
Router.get('/movies/get', allController.certainMovie)
Router.post('/movies/add', jwtVerify, allController.addMovie)
Router.patch('/movies/edit/:id', jwtVerify, allController.movieStatus)
Router.patch('/movies/set/:id', jwtVerify, allController.addSchedule)



module.exports = Router