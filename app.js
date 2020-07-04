const express = require('express')
const mongoose = require("mongoose")
const path = require('path')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./config/db')
const passport = require('passport')
const session = require('express-session')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo')(session)

//Load Config
dotenv.config({path : './config/config.env'})

//Passport Config
require('./config/passport')(passport)

connectDB()

//Logging
const app = express()

//body parser
app.use(express.urlencoded({extended:false}))
app.use(express.json())


//Method Override
app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body === 'object' && '_method' in req.body){
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

if(process.env.NODE_ENV === "development"){
    app.use(morgan('dev'))
}

//Handlebars helpers
const {formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs')

//Handlebars
app.engine('.hbs',exphbs({helpers:{formatDate, stripTags, truncate, editIcon, select} ,defaultLayout:'main', extname:'.hbs'}));
app.set('view engine','.hbs');

//Session
app.use(session({
    secret:'keyboard cat',
    resave: false,
    saveUninitialized:false,
    store: new MongoStore({mongooseConnection : mongoose.connection})
}))

//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//Set Global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

//Static Folder
app.use(express.static(path.join(__dirname,'public')))

//Routes
app.use('/', require('./routes/index'))
app.use("/auth", require("./routes/auth"))
app.use("/stories", require("./routes/stories"))

const PORT = process.env.PORT || 5000


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`))
