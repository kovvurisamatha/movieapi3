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
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
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
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getquery = `select * from movie
  where movie_id=${movieId} `
  dbresponse = await db.get(getquery)
  response.send(convertDbObjectToResponseObject(dbresponse))
})
