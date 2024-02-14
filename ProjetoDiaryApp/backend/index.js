const express = require('express');
const cors = require('cors')
const exphbs = require('express-handlebars');
const app = express();
const session = require('express-session');
const flash = require('express-flash');
const FileStore = require('session-file-store')(session)

//db conn
const conn = require('./db/conn')

//models
const User = require('./models/User')
const Notes = require('./models/Notes')

//routes require
const notesRoutes = require('./routes/notesRoutes');
const authRoutes = require('./routes/authRoutes')

//controllers
const NotesController = require('./controllers/NotesController');


//template engine
app.engine('handlebars', exphbs.engine())
app.set('view engine', 'handlebars')

//msgs alert
app.use(flash());

//request body
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

//Solving CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));


//public Imgs
app.use(express.static('public'));

//session middleware
app.use(
    session({
        name: "session",
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        store: new FileStore({
            logFn: function() {},
            path: require('path').join(require('os').tmpdir(), 'sessions'),
        }),
        cookie: {
            secure: false,
            maxAge: 360000,
            expires: new Date(Date.now() + 360000),
            httpOnly: true
        }
    })
);

//routes
app.use('/users', authRoutes)
app.use('/notes', notesRoutes)


conn
.sync().then(() => {
    app.listen(3333)
}).catch((err) => console.log(err))