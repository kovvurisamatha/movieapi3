const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
let db = null
const dbPath = path.join(__dirname, 'moviesData.db')
const initializeAndStartDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB error:${e.message}`)
    process.exit(1)
  }
}
initializeAndStartDb()
module.exports = app
const convertDbObjectToResponseObject = dbobject => {
  return {
    movieName: dbobject.movie_name,
  }
}
//api1
app.get('/movies/', async (request, response) => {
  const movieQuery = `select * from movie`
  let movies = await db.all(movieQuery)
  response.send(
    movies.map(eachmovie => convertDbObjectToResponseObject(eachmovie)),
  )
})
//api2
app.post('/movies/', async (request, response) => {
  const movie_details = request.body
  const {directorId, movieName, leadActor} = movie_details
  const addquery = `insert into movie
  (director_id,movie_name,lead_actor)
  values(${directorId},'${movieName}','${leadActor}') `
  const dbresponse = await db.run(addquery)
  const movie_id = dbresponse.lastId
  response.send('Movie Successfully Added')
})
//api3
app.get('/movies/:movieId/', async(request, response) => {
  const {movieId} = request.params
  const getquery = `select * from movie
  where movie_id=${movieId} `
  dbresponse = await db.get(getquery)
  response.send(convertDbObjectToResponseObject(dbresponse))
})
//api4
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const moviedetails = request.body
  const {directorId, movieName, leadActor} = moviedetails
  const updatequery = `update movie
  set director_id=${directorId},movie_name='${movieName}',lead_actor='${leadActor}' 
  where movie_id=${movieId}`
  await db.run(updatequery)
  response.send('Movie Details Updated')
})
//api5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletequery = `delete from movie where movie_id=${movieId}`
  await db.run(deletequery)
  response.send('Movie Removed')
})
const convertintocamelcase = dbobject => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  }
}
//api6
app.get('/directors', async (request, response) => {
  const directorquery = `select * from director`
  dbresponse = await db.all(directorsquery)
  response.send(
    dbresponse.map(eachplayer => {
      convertintocamelcase(eachplayer)
    }),
  )
})
module.exports = app
//api7
const getmovienames = dbobject => {
  return {
    movieName: dbobject.movie_name,
  }
}
app.get('/directors/:directorsId/movies/', async (request, response) => {
  const {directorId} = request.params
  const moviequery = `select * from movie where 
  director_id=${directorId}`;
  dbresponse = await db.all(moviequery)
  response.send(
    dbresponse.map(eachmovie => {
      getmovienames(eachmovie)
    }),
  )
})
