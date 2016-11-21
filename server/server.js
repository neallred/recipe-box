const _ = require('lodash')
const express = require('express')
const path = require('path')
const webpack = require('webpack')
const compress = require('compression')
const bodyParser = require('body-parser') 
const cookieParser = require('cookie-parser')

const isDevelopment = (process.env.NODE_ENV !== 'production')
const static_path = path.join(__dirname, '../dist')

const util = require('util')
const exec = require('child_process').exec

//start and configure rethinkdb
exec("rethinkdb", (error, stdout, stderr) => {console.log(stdout)})

var r = require('rethinkdb')

// Create a connection.
const connectionConfig = {
	host: 'localhost',
	port: 28015
}

const c = (callback) => { r.connect(connectionConfig, (err, conn) => { callback(conn) }) }

const app = express()

app.use(express.static(static_path))
	.get('/', function (req, res) {
		res.sendFile('index.html', {
			root: static_path
		})
	}).listen(process.env.PORT || 8000, function (err) {
		if (err) {console.log(err) }
		console.log('Listening at localhost:8000')
	})

//middlewares
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(compress())
//app.use(cookieMiddleware)
//app.use is global? And to use middleware just on one endpoint, just apply it as an argument there?


	
//GET RECIPES ENDPOINT
app.get('/recipes', authenticationMiddleware, function getRecipes(req, res, next) {
	c((conn) => {
		r.table('recipes').
			run(conn, function(err, cursor) {
				if (err) { throw err }
				cursor.toArray(function(err, result) {
					if (err) { throw err }
					console.log(JSON.stringify(result[0], null, 2))
					return res.send(JSON.stringify(result))
				})
			})
	})
})

//CREATE RECIPE ENDPOINT
app.post('/recipes', function createRecipe(req, res, next) {
	const { body = {}, params = {} } = req
	const { name, ingredients, instructions, author } = body
	const { id } = params

	if (!name || !name.trim()) {
		return res.send('Unable to create recipe, no recipe name was supplied')
	}

	const insertObject = {}
	insertObject.hideIngredients = true
	if (name) { insertObject.name = name}
	if (ingredients) { insertObject.ingredients = ingredients}
	if (instructions) { insertObject.instructions = instructions}
	if (author) { insertObject.author = author}

	c((conn) => {
		r.table('recipes').insert(insertObject)
			.run(conn, function(err, result) {
				if (err) { throw err }
				const newId = result && result.generated_keys && result.generated_keys[0]
				console.log(newId)
				r.table('recipes').get(newId).run(conn, function(err, resultFetch) {
					if (err) { throw err }
					console.log('new recipe:')
					console.log(JSON.stringify(resultFetch))
					const newRecipe = _.merge({}, resultFetch, {id: newId})
					return res.send(JSON.stringify(newRecipe))
				})
			})
	})
})

//UPDATE RECIPE
app.put('/recipes/:id', function updateRecipe(req, res, next) {
	const { body = {}, params = {} } = req
	const {id} = params
	const { name, ingredients, instructions, author } = body
	const requestLogTemplate = `User tried to update recipe of id ${id} with
name: ${name},
ingredients: ${ingredients},
instructions: ${instructions},
author: ${author}
`

	console.log(requestLogTemplate)
	const updateObject = {}
	if (name) { updateObject.name = name}
	if (ingredients) { updateObject.ingredients = ingredients}
	if (instructions) { updateObject.instructions = instructions}
	if (author) { updateObject.author = author}
	
	c((conn) => {
		r.table('recipes').get(id).update(updateObject)
			.run(conn, function(err, result) {
				if (err) { throw err }
				console.log(result)
				r.table('recipes').get(id).run(conn, function(err, resultFetch) {
					if (err) { throw err }
					console.log(JSON.stringify(resultFetch))
					return res.send(JSON.stringify(resultFetch))
				})
			})
	})
})

//DELETE RECIPE
app.delete('/recipes/:id', isLoggedIn, function deleteRecipe(req, res, next) {
	const { params = {} } = req
	const {id} = params
	c((conn) => {
		r.table("recipes").get(id).delete()
			.run(conn, function(err, result) {
				if (err) { throw err }
				console.log(result)
				if (result.deleted) {
					return res.send({message: `You deleted recipe of id ${id}`, id})
				}
				else if (!result.deleted && result.skipped) {
					return res.send({message: `Unable to delete recipe of id ${id}`})
				}
			})
	})
})

app.post('/session', sessionMiddleware, function createSession(req, res, next) {
	const { params = {} } = req
	const {id} = params

	res.send({
		message: 'You tried to create a session cookie.'
	})
	//c((conn) => {
	//	r.table("recipes").get(id).delete()
	//		.run(conn, function(err, result) {
	//			if (err) { throw err }
	//			console.log(result)
	//			if (result.deleted) {
	//				return res.send({message: `You deleted recipe of id ${id}`, id})
	//			}
	//			else if (!result.deleted && result.skipped) {
	//				return res.send({message: `Unable to delete recipe of id ${id}`})
	//			}
	//		})
	//})
})

app.delete('/session', sessionMiddleware, function deleteSession(req, res, next) {
	const { params = {} } = req
	const {id} = params

	res.send({
		message: 'You tried to delete a session cookie.'
	})
	//c((conn) => {
	//	r.table("recipes").get(id).delete()
	//		.run(conn, function(err, result) {
	//			if (err) { throw err }
	//			console.log(result)
	//			if (result.deleted) {
	//				return res.send({message: `You deleted recipe of id ${id}`, id})
	//			}
	//			else if (!result.deleted && result.skipped) {
	//				return res.send({message: `Unable to delete recipe of id ${id}`})
	//			}
	//		})
	//})
})







function authenticationMiddleware(req, res, next) {
	const cookie = req && req.cookies && req.cookies.session

	console.log(cookie);
	if ( cookie ) {
		return next();
	}
}


function sessionMiddleware(req, res, next) {
	const cookie = req && req.cookies && req.cookies.session

	if (req.method === 'POST') {
		if (cookie === undefined) {
			const randomNumber = Math.floor((Math.random() * 1000000)).toString()
			res.cookie('session','userSession'+randomNumber, { maxAge: 9000000, httpOnly: true })
		} 
		else {
			console.log('cookie exists', cookie)
		} 
	}
	else if (req.method === 'DELETE') {
		res.cookie('session', '', { expires: new Date() })
	}
	next()
}



function isLoggedIn(req, res, next) {
	if (req.isAuthenticated) { return next(); }
	res.send('Nice try, bubs');
}