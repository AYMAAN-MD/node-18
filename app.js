const express = require('express');
const Pool = require('pg').Pool;
const PORT = 3001;
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');


// function weiteToFile(fileName, data) {
//     return fstat.writeFileSync(path.join(process.cwd(), fileName),data);
// }

// function init(){
//     inquirer.prompt(question).then((responses) => {
//         console.log("Creating Professional README.md File ...");
//         writeToFile("./dist/README.md" , generateMarkdown({...responses}));
//     });
// }

// init();

const pool = new Pool({
    user: process.env.USER_NAME,
    host:process.env.HOST_NAME,
    database : process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DIALECT,
    port : process.removeListener.PORT_NUMBER
})


pool.connect((err, client, release)=>{
    if(err){
        return console.error('Error in connection')
    }
    client.query('SELECT NOW()' , (err, result)=>{
        release()
        if(err){
            return console.error('error executing query')
        }
        console.log("Connected to database")
    })
})


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')
app.use('/static',express.static('static'))

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get('/',async(req,res)=>{
    res.render('interface')
})

// Route d'inscription d'un membre
app.post('/members', (req, res) => {
  const { nom, prenom, date_naissance, sexe, telephone, pays } = req.body;

  // Vérification des conditions d'inscription
  let ageMinimum = 18;
  if (pays.toLowerCase() === 'maroc') {
    ageMinimum = 16;
  }

  const now = moment();
  const dateNaissance = moment(date_naissance, 'DD/MM/YYYY');
  const age = now.diff(dateNaissance, 'years');

  if (age < ageMinimum) {
    return res.status(400).json({ message: `L'âge minimum requis est de ${ageMinimum} ans.` });
  }

  const heure = now.hours();
  let etat = 'en attente';
  if (heure >= 12 && heure <= 21) {
    etat = 'valide';
  }

  // Insertion du membre dans la base de données
  const dateInscription = moment().format('YYYY-MM-DD HH:mm:ss');

  const query = 'INSERT INTO member (nom, prenom, date_naissance, sexe, telephone, pays, date_inscription, etat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  const values = [nom, prenom, dateNaissance.format('YYYY-MM-DD'), sexe, telephone, pays, dateInscription, etat];

  pool.query(query, values, (error, result) => {
    if (error) {
      console.error('Erreur lors de l\'inscription du membre :', error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription.' });
    }

    res.status(200).json({ message: 'Inscription réussie.' });
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});




// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine','ejs')
// app.use('/static',express.static('static'))

// app.use(express.urlencoded({extended:true}))
// app.use(express.json())

// app.get('/',async(req,res)=>{
//     res.render('interface')
// })

// app.post('/members', async(req, res)=>{
//     const {nom, prénom, date_de_naissance,sexe, télephone, pays, date_inscription, état} = req.body ;
//     try {
//         const result = await pool.query(`INSERT INTO member (nom, prénom, date_de_naissance,sexe, télephone, pays, date_inscription, état) VALUES($1,$2,$3,$4,$5,$6,$7,$8)
//         RETURNING *`,[nom, prénom, date_de_naissance, sexe, télephone, pays, date_inscription, état])
//         console.log(result);
//         res.redirect('/')
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({message: error.message})
//     }
// })




// app.listen(PORT, ()=>{console.log(`Server started at port ${PORT}`)})