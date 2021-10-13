const express = require("express")
const path = require("path")
const app = express()

const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('aquawelt', "root", "root", {
    host: "localhost",
    dialect: "mysql",
    dialectOptions: {

    }
});

sequelize.authenticate().then(() => {
    console.log("erfolgreich mit mySQL verbunden")
}).catch(err => {
    console.log("fehler beim verbinden: ", err)
})

class Post extends Model{}
Post.init({
    username: DataTypes.STRING,
    date: DataTypes.DATE,
    content: DataTypes.TEXT,
    tag: DataTypes.STRING
}, {
    sequelize,
    modelName: 'post'
});

sequelize.sync({force:true})

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use('/public', express.static('public'));


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/new", (req, res) => {
    const post = Post.create({
        username: "admin",
        date: new Date(),
        content: "hello world",
        tag: "test"
    })
    res.send("done")
})

app.get("/admin", async (req, res) => {
    const reject = () => {
        res.setHeader('www-authenticate', 'Basic')
        res.sendStatus(401)
    }

    const authorization = req.headers.authorization

    if(!authorization) {
        return reject()
    }

    const [username, password] = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString().split(':')

    if(! (username === 'admin' && password === 'admin123')) {
        return reject()
    }

    const allPosts = await Post.findAll();

    res.render("admin/adminpanel", {
        posts: allPosts
    })
})

app.get('/:tag', async function(req , res){
    const post = await Post.findOne({ where: { tag: req.params.tag } });

    if (post === null) {
        res.status(404).render("404");
    } else {
        res.send('tag: ' + req.params.tag + "; content: " + post.content);
    }
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', (req, res) => {
    res.status(404).render("404");
});

app.listen(3000, () => {
    console.log("server listening on port 3000")
})