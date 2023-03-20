const express = require('express');
const cors = require('cors');
const mysql = require('mysql')

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const crypto = require('crypto')
require('dotenv').config();

const mail = require("./mail");
const path = require('path');
const process = require('process');
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors({
  origin: ["https://youthspiritualsummit.netlify.app"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: "user_id",
  secret: process.env.JWT_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000
  }
}));

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const db = mysql.createConnection({
  host: "35.236.85.131",
  user: "yssadmin",
  database: 'newYss',
  password: "*Mu$limRetre@t20"
});

db.connect(err => {
  if (err) {
    throw err
  }
  console.log("MySQL connected");
});


const verifyJWT = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    res.send("No token found");
  } else {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        res.send({ auth: false, message: "Authentication failed." });
      } else {
        req.user_id = decoded.id;
        next();
      }
    })
  }
}


app.post('/register', (req, res) => {
  const { email, password, first_name, last_name, account_type } = req.body;
  const id = crypto.randomUUID();

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    db.query("INSERT INTO accounts (id, email, first_name, last_name, user_password, account_type) VALUES (?,?,?,?,?,?)",
      [id, email, first_name, last_name, hash, account_type],
      (err) => {
        if (err) { console.log(err); }
        if (account_type === "parent") {
          db.query("INSERT INTO parents (parent_id) VALUES (?)", [id],
            (error) => { if (error) throw error; }
          )
        }
        res.send({ message: "Account created" });
      }
    )
  })
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM accounts WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }
      if (result.length > 0) {
        bcrypt.compare(password, result[0].user_password,
          (err, response) => {
            if (err) { console.log(err); }
            if (response) {
              req.session.user = { "user_id": result[0].id, "account_type": result[0].account_type };
              const jwtToken = jwt.sign(
                { user_id: result[0].id, account_type: result[0].account_type },
                process.env.JWT_KEY,
                { expiresIn: '1d' }
              );
              res.send({ auth: true, token: jwtToken });
            }
            else {
              res.send({ auth: false, message: "Invalid email and password combination." });
            }
          });
      } else {
        res.send({ auth: false, message: "Email has not been registered." });
      }
    });
});

app.post('/parentDetails', (req, res) => {
  const parentBirthday = formatDate(req.body.parentBirthday)
  const street = req.body.street
  const city = req.body.city
  const zip = req.body.zip
  const ec1Name = req.body.ec1Name
  const ec1Phone = req.body.ec1Phone
  const ec1Relation = req.body.ec1Relation
  const ec2Name = req.body.ec2Name
  const ec2Phone = req.body.ec2Phone
  const ec2Relation = req.body.ec2Relation
  const insuranceProvider = req.body.insuranceProvider
  const insuranceHolder = req.body.insuranceHolder
  const insuranceNumber = req.body.insuranceNumber
  const parentID = req.body.parentID
  const phone = req.body.parentPhone

  console.log(parentID)
  db.query(
    "Update parents Set birthday=?, phone_number=?, address_street=?, address_city=?, address_zip=?, ec_name1=?, ec_phone1=?, ec_relation1=?, insurance_provider=?, insurance_policy_holder=?, insurance_policy_number=?, ec_name2=?, ec_phone2=?, ec_relation2=? where parent_id=?",
    [parentBirthday, phone, street, city, zip, ec1Name, ec1Phone, ec1Relation, insuranceProvider, insuranceHolder, insuranceNumber,ec2Name, ec2Phone, ec2Relation, parentID], (err, result) => {
      console.log(err)
      res.send({message: "Update Finished"})
    }
  )
})

app.post("/sendConfirmEmail", (req, res) => {
  const emailTo = req.body.email
  const name = req.body.name
  const account_type = req.body.account_type
  let date = new Date();
  const emailBody = `<p>Dear ${name},</p>
  <p>Thank you for registering a ${account_type} account for the Youth Spiritual Summit ${date.getFullYear()}!  
  You can now log in with the account credentials you just created and continue with the application process for your youth.
  We look forward to having them join us for another year of incredible programming.
  Please feel free to get in touch with us at youthspiritualsummit@gmail.com if you are encountering any issues.</p>
  <p>Warm Regards,</p>
  <p>The Youth Spiritual Summit Registration Team</p>
  <a href="https://youthspiritualsummit.weebly.com/"><img width="200px" src="cid:logo"></a>`
  const emailSubject = "Youth Spiritual Summit Account Registration"

  mail.authorize().then((auth) => {
    mail.emailYouth(auth, emailTo, emailSubject, emailBody)
  }).then((response) => {
    console.log("Email Sent!")
    res.send(response)
  }).catch((error) => {
    res.send(error)
  });
})

app.post("/youthEmail", (req, res) => {
  db.query("Select first_name, last_name, email from accounts Where id=?", [req.body.parentID], (err, res) => {
    if (res.length > 0) {
      console.log(res)
      const currentDate = new Date()
      const emailTo = res[0].email
      // For testing purposes
      // const emailTo = 'vcheng@campizza.com'
      const parentName = res[0].first_name + ' ' + res[0].first_name
      const youthName = req.body.firstName + ' ' +req.body.lastName
      const emailBody = `<p>Dear ${parentName},</p>
      <p>Thank you for registering ${youthName} for the Youth Spiritual Summit ` +  currentDate.getFullYear() + `! 
      We look forward to having them join us for another year of incredible programming. 
      Your youth participant(s) [have/has] been sent a confirmation email with instructions on how to set up their youth portal. 
      This youth portal that they setup will be how they provide more information about themselves and eventually select their cabins and other groups. 
      Please make sure to check with your youth that they have received this email and feel free to get in touch with us at youthspiritualsummit@gmail.com 
      if you or your youth are encountering any issues.</p>
      <p>Warm Regards,</p>
      <p>The Youth Spiritual Summit Registration Team</p>
      <a href="http://localhost:3000"><img width="200px" src="cid:logo"></a>`
      const emailSubject = "Welcome to Youth Spiritual Summit"

      mail.authorize().then((auth) => {
        mail.emailYouth(auth, emailTo, emailSubject, emailBody)
      }).then(() => {
        console.log("Email Sent!")
      }).catch((error) => {
        res.send(error)
      });
    }
  })
})

app.post("/parentdashboard", (req, res) => {
  let parentID = req.body.parent_id;
  let youthInfo = [];
  let balance = 0;
  db.query('SELECT * FROM accounts WHERE id IN (SELECT youth_id FROM youth WHERE parent_id = ?)',
    [parentID],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          youthInfo.push({
            youth_id: result[i].youth_id,
            firstName: result[i].first_name,
            lastName: result[i].last_name
          })
        }
      }
      db.query(`SELECT balance FROM parents WHERE parent_id = ?`,
        [parentID],
        (error, result2) => {
          if (err) throw err;
          if (result2.length > 0) {
            balance = result2[0].balance;
          }
          res.send({ youthInfo, balance });
        })
    })
});


app.post("/financial_aid", (req) => {
  const { household, income, total, orgs, circumstance } = req.body;

  db.query(`INSERT INTO financial_aid_apps(household_size,annual_income,able_to_pay,local_org_description,circ_description, approved) 
            VALUES (?,?,?,?,?, false)`,
    [household, income, total, orgs, circumstance],
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.log();
      console.log(req.body);
    }
  );
})

app.post("/getBalance", (req, res) => {
  const parent_id = req.body.parent_id
  db.query("SELECT * FROM parents WHERE parent_id =?",[parent_id], function (err, result) {
    if (err) throw err;
    if (result.length > 0) res.send({balance: result[0].balance})
    else { res.send ({balance: 0})}
  });
})

app.post("/updPayment", (req, res) => {
  const parentID = req.body.parentID;
  db.query(`UPDATE parents SET balance = balance + 100 WHERE parent_id = ?`,
    [parentID],
    (err, result) => {
      if (err) throw err;
      console.log("updatedPayment");
    });
  console.log("balance update works");
})

app.post('/youth', (req, res) => {
  const first_name = req.body.firstName;
  const last_name = req.body.lastName;
  const birthday = formatDate(req.body.birthday);
  const grade = req.body.grade;
  const gender = req.body.gender;
  const email = req.body.email;
  const phone = req.body.phone;
  const parent_id = req.body.parentID;
  var id = 0

  db.query("SELECT * FROM accounts WHERE email=?", [email], (err, result) => {
    const youthID = result[0].id
    db.query(
      "INSERT INTO youth (youth_id, parent_id, birthday, phone_number, gender, grade) VALUES (?,?,?,?,?,?)",
      [youthID, parent_id, birthday, phone, gender, grade], (err, res) => {
        if (err) console.log(err);
      }
    )
  })

  db.query('UPDATE parents SET balance=balance+100 where parent_id=?', [parent_id])

  res.send({ message: "Youth Entry Added!" })
})

app.post('/checkEmail', (req, res) => {
  const email = req.body.email
  db.query("SELECT * FROM accounts WHERE email=?", [email], (err, result) => {
    if (result.length > 0) {
      res.send({ message: false })
    }
    else {
      res.send({ message: true })
    }
  })
})

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/", (req, res) => {
  res.send("Path does not exist");
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});