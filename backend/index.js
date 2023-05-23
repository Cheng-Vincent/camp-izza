const express = require("express");
const cors = require("cors");
const mysql = require("mysql");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const crypto = require("crypto");
var data_exporter = require("json2csv").Parser;
require("dotenv").config();

const mail = require("./mail");
const process = require("process");
const { dns } = require("googleapis/build/src/apis/dns");
const { apigateway } = require("googleapis/build/src/apis/apigateway");
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://yssmysql.wl.r.appspot.com/", "http://localhost:3000", "https://youthspiritualsummit.netlify.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "user_id",
    secret: process.env.JWT_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

function formatDate(date, hasTime = false) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  if (hasTime) {
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB,
  password: process.env.DB_PASS,
});

db.connect((err) => {
  if (err) {
    throw err;
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
    });
  }
};

app.post("/api/register", (req, res) => {
  const {
    email,
    password,
    first_name,
    last_name,
    account_type,
    registered_at,
  } = req.body;
  const id = crypto.randomUUID();
  const registered_time = formatDate(registered_at, true);
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    db.query(
      "INSERT INTO accounts (id, email, first_name, last_name, user_password, account_type, account_created) VALUES (?,?,?,?,?,?,?)",
      [id, email, first_name, last_name, hash, account_type, registered_time],
      (err) => {
        if (err) {
          console.log(err);
        }
        if (account_type === "parent") {
          db.query(
            "INSERT INTO parents (parent_id, first_name, last_name) VALUES (?, ?, ?)",
            [id, first_name, last_name],
            (error) => {
              if (error) throw error;
            }
          );
        }
        if (account_type === "counselor") {
          db.query(
            "INSERT INTO counselor (parent_id, first_name, last_name) VALUES (?, ?, ?)",
            [id, first_name, last_name],
            (error) => {
              if (error) throw error;
            }
          );
        }
        res.send({ message: "Account created" });
      }
    );
  });
});

app.get("/api/login", (req, res) => {
  if (req.session.user) {
    res.send({
      loggedIn: true,
      user: req.session.user,
    });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM accounts WHERE email = ?", [email], (err, result) => {
    if (err) {
      res.send({ err: err });
    }
    if (result.length > 0) {
      bcrypt.compare(password, result[0].user_password, (err, response) => {
        if (err) {
          console.log(err);
        }
        if (response) {
          req.session.user = {
            user_id: result[0].id,
            account_type: result[0].account_type,
          };
          const jwtToken = jwt.sign(
            { user_id: result[0].id, account_type: result[0].account_type },
            process.env.JWT_KEY,
            { expiresIn: "1d" }
          );
          res.send({
            auth: true,
            token: jwtToken,
            account_type: result[0].account_type,
            session: req.session.user
          });
        } else {
          res.send({
            auth: false,
            message: "Invalid email and password combination.",
          });
        }
      });
    } else {
      res.send({ auth: false, message: "Email has not been registered." });
    }
  });
});

app.post("/api/updateEmail", (req, res) => {
  const { id, newEmail } = req.body;
  db.query(
    "UPDATE accounts SET email = ? WHERE id = ?",
    [newEmail, id],
    (err) => {
      if (err) console.log(err);
      res.send({ message: "Email updated" });
    }
  );
});

app.post("/api/updateYouthPhone", (req, res) => {
  const { id, newPhone } = req.body;
  db.query(
    "UPDATE youth SET phone_number = ? WHERE youth_id = ?",
    [newPhone, id],
    (err) => {
      if (err) console.log(err);
      res.send({ message: "Phone number updated" });
    }
  );
});

app.post("/api/updatePassword", (req, res) => {
  const { email, id, firstName, lastName } = req.body;
  const fullName = firstName + " " + lastName;
  const resetURL =
    process.env.REACT_APP_YSS_FRONTEND_SERVER + "setpassword?id=" + id;
  const emailSubject = "Youth Spiritual Summit Account Password Reset";
  const emailResetPassword = `<p>Dear ${fullName},</p>
        <p>You requested to reset your password. Click on the following link to reset your password:</p>
        <p>${resetURL}</p>
        <p>If you did not make this request, you can disregard this message.</p>
        <p>Warm Regards,</p>
        <p>The Youth Spiritual Summit Registration Team</p>`;
  mail
    .authorize()
    .then((auth) => {
      mail.emailYouth(auth, email, emailSubject, emailResetPassword);
    })
    .then(() => {
      res.send({ message: "Email Sent!" });
    })
    .catch((error) => {
      res.send({ email_sent: false, error: error });
    });
});

app.post("/api/setPassword", (req, res) => {
  const { id, password } = req.body;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    db.query(
      "UPDATE accounts SET user_password = ? WHERE id = ?",
      [hash, id],
      (err) => {
        if (err) {
          console.log(err);
        }
        res.send({ message: "Password updated" });
      }
    );
  });
});

app.post("/api/submitParentDetails", (req, res) => {
  const parentBirthday = formatDate(req.body.parentBirthday);
  const street = req.body.street;
  const city = req.body.city;
  const zip = req.body.zip;
  const ec1Name = req.body.ec1Name;
  const ec1Phone = req.body.ec1Phone;
  const ec1Relation = req.body.ec1Relation;
  const ec2Name = req.body.ec2Name;
  const ec2Phone = req.body.ec2Phone;
  const ec2Relation = req.body.ec2Relation;
  const insuranceProvider = req.body.insuranceProvider;
  const insuranceHolder = req.body.insuranceHolder;
  const insuranceNumber = req.body.insuranceNumber;
  const parentID = req.body.parentID;
  const phone = req.body.parentPhone;
  const submission_time = formatDate(req.body.submitted_at, true);

  db.query(
    "UPDATE parents SET birthday=?,phone_number=?,address_street=?,address_city=?,address_zip=?,ec_name1=?,ec_phone1=?,ec_relation1=?,insurance_provider=?,insurance_policy_holder=?,insurance_policy_number=?,ec_name2=?,ec_phone2=?,ec_relation2=?,details_submitted_at=? WHERE parent_id=?",
    [
      parentBirthday,
      phone,
      street,
      city,
      zip,
      ec1Name,
      ec1Phone,
      ec1Relation,
      insuranceProvider,
      insuranceHolder,
      insuranceNumber,
      ec2Name,
      ec2Phone,
      ec2Relation,
      submission_time,
      parentID,
    ],
    (err, result) => {
      if (err) console.log(err);
      res.send({ message: "Form submitted" });
    }
  );
});

app.post("/api/sendConfirmEmail", (req, res) => {
  const emailTo = req.body.email;
  const name = req.body.name;
  const account_type = req.body.account_type;
  let date = new Date();
  const emailBody = `<p>Dear ${name},</p>
  <p>Assalamu Alaykum. Thank you for registering a ${account_type} account for the Youth Spiritual Summit ${date.getFullYear()}! 
  You can now log in with the account credentials you just created and continue with the application process for your youth. 
  We look forward to another year of incredible programming, inshaAllah. Please feel free to get in touch with us at youthspiritualsummit@gmail.com 
  if you are encountering any issues.</p>
  <p>Warm Regards,</p>
  <p>The Youth Spiritual Summit Registration Team</p>
  <a href="https://yssmysql.wl.r.appspot.com/"><img width="200px" src="cid:logo"></a>`;
  const emailSubject = "Youth Spiritual Summit Account Registration";

  mail
    .authorize()
    .then((auth) => {
      mail.emailYouth(auth, emailTo, emailSubject, emailBody);
    })
    .then((response) => {
      console.log("Email Sent!");
      res.send(response);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/api/youthEmail", (req, res) => {
  db.query(
    "Select first_name, last_name, email from accounts Where id=?",
    [req.body.parentID],
    (err, result) => {
      if (err) console.log(err);
      if (result.length > 0) {
        const currentDate = new Date();
        const emailTo = result[0].email;
        const emailYouth = req.body.email;
        const parentName = result[0].first_name + " " + result[0].last_name;
        const youthName = req.body.firstName + " " + req.body.lastName;
        const youthURL =
          process.env.REACT_APP_YSS_FRONTEND_SERVER +
          "setpassword?id=" +
          req.body.youthID;
        const emailBody = `<p>Dear ${parentName},</p>
      <p>Assalamu Alaykum. Thank you for registering ${youthName} for the Youth Spiritual Summit 2023! 
      We look forward to another year of incredible programming, inshaAllah.  ${youthName} has been sent a confirmation email with 
      instructions on how to set up a youth portal. This youth portal will be how ${youthName} provides more personal information and 
      eventually select a cabin and other groups. Please make sure to check that ${youthName} has received this email and feel 
      free to get in touch with us at youthspiritualsummit@gmail.com if you or ${youthName} are encountering any issues.</p>
      <p>Warm Regards,</p>
      <p>The Youth Spiritual Summit Registration Team</p>
      <a href="https://yssmysql.wl.r.appspot.com/"><img width="200px" src="cid:logo"></a>`;
        const emailSubject = "Welcome to Youth Spiritual Summit";

        // const emailYouthSubject = "Set up Your Youth Spiritual Summit Account"
        // const emailYouthBody = `<p>Dear ${youthName},</p>
        // <p>Assalamu Alaykum. Your youth account is now ready for you to log in.
        // Please click on the following link to create a password and log into your account.</p>
        // <p>${youthURL}</p>
        // <p>Once you successfully log in, you can update your contact information and complete your
        // pre-retreat survey. Both of these must be complete before you can select your Family, Cabin
        // and Bus so be sure to do that as soon as possible.</p>
        // <p>Group selections should open up around July 23rd so keep an eye out from email updates.</p>
        // <p>Warm Regards,</p>
        // <p>The Youth Spiritual Summit Registration Team</p>`

        const emailYouthSubject = "Set up Your Youth Spiritual Summit Account";
        const emailYouthBody = `<p>Dear ${youthName},</p>
      <p>Assalamu Alaykum. Your parent/guardian has added you to their account. Once we have opened family, cabin and bus selections, 
      you will be notified to log in so that you can make those selections and answer some additional questions. Pay careful attention 
      to your emails so that you receive that message from us when the time comes. If you have not already, please make sure messages 
      from "youthspiritualsummit@gmail.com" do not end up in your spam or junk filters. We look forward to another year of incredible 
      programming, inshaAllah.</p>
      <p>Warm Regards,</p>
      <p>The Youth Spiritual Summit Registration Team</p>`;

        mail
          .authorize()
          .then((auth) => {
            mail.emailYouth(auth, emailTo, emailSubject, emailBody);
            mail.emailYouth(
              auth,
              emailYouth,
              emailYouthSubject,
              emailYouthBody
            );
          })
          .then(() => {
            res.send({ email_sent: true });
          })
          .catch((error) => {
            res.send({ email_sent: false, error: error });
          });
      }
    }
  );
});

app.post("/api/getfinancialApps", (req, res) => {
  const financial_apps = [];
  const youthDetails = [];
  db.query(
    `select id, household_size, phone_number,annual_income, balance, able_to_pay,local_org_description,circ_description,
                approved,email,parents.first_name,parents.last_name FROM accounts, financial_aid_apps, parents 
                WHERE accounts.id = financial_aid_apps.parent_id  
                AND financial_aid_apps.parent_id= parents.parent_id
                ORDER BY FIELD(approved, 'pending', 'approved', 'denied')`,
    (err, result) => {
      if (err) console.log(err);
      else {
        for (let i = 0; i < result.length; i++) {
          financial_apps.push({
            id: result[i].id,
            household_size: result[i].household_size,
            annual_income: result[i].annual_income,
            balance: result[i].balance,
            able_to_pay: result[i].able_to_pay,
            local_org: result[i].local_org_description,
            circ_desc: result[i].circ_description,
            status: result[i].approved,
            email: result[i].email,
            first: result[i].first_name,
            last: result[i].last_name,
            phone: result[i].phone_number,
          });
        }
      }

      db.query(
        `SELECT id, financial_aid_apps.parent_id, youth.first_name, youth.last_name, grade FROM youth, financial_aid_apps, 
        accounts where youth.parent_id = financial_aid_apps.parent_id AND youth.youth_id = 
        accounts.id`,
        (err, result) => {
          if (err) throw err;
          else {
            for (let i = 0; i < result.length; i++) {
              youthDetails.push({
                id: result[i].id,
                first: result[i].first_name,
                last: result[i].last_name,
                grade: result[i].grade,
                parentID: result[i].parent_id,
              });
            }
          }
          res.send({ youthDetails, financial_apps });
        }
      );
    }
  );
});

app.post("/api/updateParentBalance", (req, res) => {
  let parentID = req.body.parentID;
  let balance = req.body.balance;
  let status = req.body.status;
  db.query(
    `UPDATE parents SET balance = ? WHERE parent_id =?`,
    [balance, parentID],
    (err, result) => {
      if (err) throw err;
      db.query(
        `UPDATE financial_aid_apps SET approved = ? WHERE parent_id = ?`,
        [status, parentID],
        (err, result) => {
          if (err) throw err;
        }
      );
    }
  );
});

app.post("/api/denyFinancialApplication", (req, res) => {
  let parentID = req.body.parentID;
  let status = req.body.status;
  db.query(
    `UPDATE financial_aid_apps SET approved = ? WHERE parent_id = ?`,
    [status, parentID],
    (err, result) => {
      if (err) throw err;
    }
  );
});

app.post("/api/parentdashboard", (req, res) => {
  let parentID = req.body.parent_id;
  let youthInfo = [];
  let parentDetailsCompleted = false;
  let balance = 0;
  let financialAid = false;
  db.query(
    "SELECT * FROM accounts WHERE id IN (SELECT youth_id FROM youth WHERE parent_id = ?)",
    [parentID],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          youthInfo.push({
            youth_id: result[i].youth_id,
            firstName: result[i].first_name,
            lastName: result[i].last_name,
          });
        }
      }
      db.query(
        `SELECT *
                      FROM parents
                      WHERE parent_id = ?`,
        [parentID],
        (error, result2) => {
          if (error) throw error;
          if (result2.length > 0) {
            balance = result2[0].balance;
            if (result2[0].phone_number) {
              parentDetailsCompleted = true;
            }
          }
          db.query(
            "SELECT * FROM financial_aid_apps WHERE parent_id = ?",
            [parentID],
            (err, result3) => {
              if (err) throw err;
              if (result3.length > 0) {
                financialAid = true;
              }
              res.send({
                youthInfo,
                balance,
                parentDetailsCompleted,
                financialAid,
              });
            }
          );
        }
      );
    }
  );
});

app.post("/api/youthdashboard", (req, res) => {
  const youth_id = req.body.youth_id;
  let youth_info = {};
  let youth_groups = {};
  db.query(
    "SELECT accounts.first_name, accounts.last_name, accounts.email, youth.* " +
    "FROM accounts INNER JOIN youth ON accounts.id = youth.youth_id WHERE accounts.id = ?",
    [youth_id],
    (err, result) => {
      if (err) console.log(err);
      if (result && result.length > 0) {
        youth_info = result[0];
      }
      db.query(
        "SELECT * FROM youth_groups WHERE youth_id = ?",
        [youth_id],
        (err2, result2) => {
          if (err2) console.log(err2);
          if (result2 && result2.length > 0) {
            db.query(
              "SELECT buses.id as b_id, buses.name as bus, buses.capacity as b_capacity, buses.count as b_count, " +
              "families.id as f_id, families.name as family, families.capacity as f_capacity, families.grade as f_grade, families.count as f_count, " +
              "cabins.id as c_id, cabins.name as cabin, cabins.capacity as c_capacity, cabins.gender as c_gender, cabins.count as c_count " +
              "FROM (((youth_groups " +
              "INNER JOIN buses ON youth_groups.bus_id = buses.id) " +
              "INNER JOIN families ON youth_groups.family_id = families.id) " +
              "INNER JOIN cabins ON youth_groups.cabin_id = cabins.id) " +
              "WHERE youth_groups.bus_id=? AND youth_groups.family_id=? AND youth_groups.cabin_id=?;",
              [result2[0].bus_id, result2[0].family_id, result2[0].cabin_id],
              (err3, result3) => {
                if (err3) console.log(err3);
                if (result3 && result3.length > 0) {
                  youth_groups = result3[0];
                }
                res.send({ youth_info, youth_groups });
              }
            );
          } else {
            res.send({ youth_info, youth_groups });
          }
        }
      );
    }
  );
});

app.post("/api/groupRosters", (req, res) => {
  const { bus_id, family_id, cabin_id } = req.body;
  let bus_roster = [];
  let family_roster = [];
  let cabin_roster = [];

  db.query(
    "SELECT CONCAT_WS(' ', first_name, last_name) as youth_name " +
    "FROM accounts WHERE accounts.id IN " +
    "(SELECT youth_groups.youth_id FROM youth_groups WHERE youth_groups.bus_id = ?);",
    [bus_id],
    (err, result) => {
      if (err) console.log(err);
      if (result && result.length > 0) {
        bus_roster = result;
      }
      db.query(
        "SELECT CONCAT_WS(' ', first_name, last_name) as youth_name " +
        "FROM accounts WHERE accounts.id IN " +
        "(SELECT youth_groups.youth_id FROM youth_groups WHERE youth_groups.family_id = ?);",
        [family_id],
        (err2, result2) => {
          if (err2) console.log(err2);
          if (result2 && result2.length > 0) {
            family_roster = result2;
          }
          db.query(
            "SELECT CONCAT_WS(' ', first_name, last_name) as youth_name " +
            "FROM accounts WHERE accounts.id IN " +
            "(SELECT youth_groups.youth_id FROM youth_groups WHERE youth_groups.cabin_id = ?);",
            [cabin_id],
            (err3, result3) => {
              if (err3) console.log(err3);
              if (result3 && result3.length > 0) {
                cabin_roster = result3;
              }
              res.send({
                bus_roster: bus_roster,
                family_roster: family_roster,
                cabin_roster: cabin_roster,
              });
            }
          );
        }
      );
    }
  );
});

app.post("/api/financial_aid", (req, res) => {
  const {
    parent_id,
    household,
    income,
    total,
    orgs,
    circumstance,
    submitted_at,
  } = req.body;
  const submission_time = formatDate(submitted_at, true);

  db.query(
    `INSERT INTO financial_aid_apps(parent_id, household_size,annual_income,able_to_pay,local_org_description,circ_description,submitted_at,approved) 
            VALUES (?,?,?,?,?,?,?,'pending')`,
    [parent_id, household, income, total, orgs, circumstance, submission_time],
    (err) => {
      if (err) {
        console.log(err);
      }
      res.send({ message: "Financial aid form submitted" });
    }
  );
});

app.post("/api/getBalance", (req, res) => {
  const parent_id = req.body.parent_id;
  db.query(
    "SELECT * FROM parents WHERE parent_id =?",
    [parent_id],
    function (err, result) {
      if (err) throw err;
      if (result.length > 0) res.send({ balance: result[0].balance });
      else {
        res.send({ balance: 0 });
      }
    }
  );
});

app.post("/api/updPayment", (req, res) => {
  const parent_id = req.body.parent_id;
  db.query(
    `UPDATE parents
              SET balance = 0
              WHERE parent_id = ?`,
    [parent_id],
    function (err, result) {
      if (err) throw err;
      res.send({ message: "Your payment has been received!" });
    }
  );
});

app.post("/api/youth", (req, res) => {
  const birthday = formatDate(req.body.birthday);
  const grade = req.body.grade;
  const gender = req.body.gender;
  const email = req.body.email;
  const phone = req.body.phone;
  const parent_id = req.body.parentID;

  db.query("SELECT * FROM accounts WHERE email=?", [email], (err, result) => {
    const youthID = result[0].id;
    const firstName = result[0].first_name;
    const lastName = result[0].last_name;
    db.query(
      "INSERT INTO youth (youth_id, first_name, last_name, parent_id, birthday, phone_number, gender, grade) VALUES (?,?,?,?,?,?,?,?)",
      [youthID, firstName, lastName, parent_id, birthday, phone, gender, grade],
      (err) => {
        if (err) console.log(err);
        db.query(
          "UPDATE parents SET balance=balance + (SELECT price FROM prices WHERE active = 1) where parent_id=?",
          [parent_id],
          (err2) => {
            if (err2) console.log(err);
            res.send({ message: "Youth added", id: youthID });
          }
        );
      }
    );
  });
});

app.post("/api/checkEmail", (req, res) => {
  const email = req.body.email;
  db.query("SELECT * FROM accounts WHERE email=?", [email], (err, result) => {
    if (result.length > 0) {
      res.send({
        message: false,
        id: result[0].id,
        firstName: result[0].first_name,
        lastName: result[0].last_name,
      });
    } else {
      res.send({ message: true });
    }
  });
});

app.post("/api/checkPassword", (req, res) => {
  const { id, password } = req.body;
  db.query(
    "SELECT user_password FROM accounts WHERE id = ?",
    [id],
    (err, result) => {
      if (err) console.log(err);
      if (result && result.length > 0) {
        bcrypt.compare(password, result[0].user_password, (error, response) => {
          if (error) console.log(error);
          if (response) {
            res.send({ message: true });
          } else {
            res.send({ message: false });
          }
        });
      }
    }
  );
});

app.post("/api/checkAccount", (req, res) => {
  const id = req.body.id;
  db.query("SELECT * FROM accounts WHERE id=?", [id], (err, result) => {
    if (result.length > 0) {
      res.send({ message: false });
    } else {
      res.send({ message: true });
    }
  });
});

app.post("/api/groupdisplay", (req, res) => {
  const youthID = req.body.youthID;

  const familyListPromise = new Promise((resolve, reject) => {
    const initialQuery = `SELECT DISTINCT id, name, capacity
                              FROM families
                              WHERE families.grade = (SELECT grade FROM youth WHERE youth_id = '${youthID}');`;

    db.query(initialQuery, (err, familyIdsResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving family data");
      } else {
        const familyList = [];
        const familyIds = familyIdsResult.map((row) => row.id);
        let count = 0;

        familyIds.forEach((familyID, index) => {
          const query = `SELECT first_name, last_name, name
                                   FROM youth_groups
                                            INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                            INNER JOIN families ON families.id = youth_groups.family_id
                                   WHERE family_id = ${familyID}`;

          db.query(query, (err, membersResult) => {
            if (err) {
              console.log(err);
              reject("Error retrieving family member list data");
            } else {
              const members = membersResult.map((row) => ({
                firstName: row.first_name,
                lastName: row.last_name,
              }));

              familyList.push({
                id: familyID,
                name: familyIdsResult[index].name,
                capacity: familyIdsResult[index].capacity,
                members,
                isFull: members.length >= familyIdsResult[index].capacity,
              });
              count++;
              if (count === familyIdsResult.length) {
                resolve(familyList);
              }
            }
          });
        });
      }
    });
  });

  const busListPromise = new Promise((resolve, reject) => {
    db.query(
      "SELECT DISTINCT bus_id, capacity " +
      "FROM youth_groups " +
      "INNER JOIN buses ON id = youth_groups.bus_id ",
      (err, busIdsResult) => {
        if (err) {
          console.log(err);
          reject("Error retrieving bus data");
        }

        const busIds = busIdsResult.map((row) => row.bus_id);
        let busList = [];

        busIds.forEach((busId, index) => {
          const query = `SELECT first_name, last_name, name
                                   FROM youth_groups
                                            INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                            INNER JOIN buses ON buses.id = youth_groups.bus_id
                                   WHERE bus_id = ${busId}`;

          db.query(query, (err, membersResult) => {
            if (err) {
              console.log(err);
              reject("Error retrieving bus member list data");
            }

            const members = membersResult.map((row) => ({
              firstName: row.first_name,
              lastName: row.last_name,
            }));
            const isFull = members.length >= busIdsResult[index].capacity;

            busList[index] = {
              id: busId,
              name: membersResult[0].name,
              members,
              capacity: busIdsResult[index].capacity,
              isFull,
            };

            if (index === busList.length - 1) {
              resolve(busList);
            }
          });
        });
      }
    );
  });

  const cabinListPromise = new Promise((resolve, reject) => {
    const cabinQuery = `SELECT id, name, capacity
                            FROM cabins
                            WHERE gender = (SELECT gender FROM youth WHERE youth_id = '${youthID}')`;

    db.query(cabinQuery, (err, cabinIdsResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving cabin data");
      } else {
        const cabinIds = cabinIdsResult.map((row) => row.id);
        let cabinList = [];

        cabinIds.forEach((cabinId, index) => {
          const query = `SELECT first_name, last_name, name
                                   FROM youth_groups
                                            INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                            INNER JOIN cabins ON cabins.id = youth_groups.cabin_id
                                   WHERE cabin_id = ${cabinId}`;

          db.query(query, (err, membersResult) => {
            if (err) {
              console.log(err);
              reject("Error retrieving cabin member list data");
            } else {
              const members = membersResult.map((row) => ({
                firstName: row.first_name,
                lastName: row.last_name,
              }));

              cabinList[index] = {
                id: cabinId,
                name: cabinIdsResult[index].name,
                capacity: cabinIdsResult[index].capacity,
                members,
                isFull: members.length >= cabinIdsResult[index].capacity,
              };
              if (index === cabinIds.length - 1) {
                resolve(cabinList);
              }
            }
          });
        });
      }
    });
  });

  Promise.all([familyListPromise, busListPromise, cabinListPromise])
    .then(([familyList, busList, cabinList]) => {
      res.send({ familyList, busList, cabinList });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.get("/api/groupdisplayforadmin", (req, res) => {
  const familyListPromise = new Promise((resolve, reject) => {
    const initialQuery = `SELECT id, name, capacity, grade
                              FROM families;`;

    db.query(initialQuery, (err, familyResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving family data");
      } else {
        const familyList = familyResult.map((row) => ({
          id: row.id,
          name: row.name,
          capacity: row.capacity,
          members: [],
          isFull: false, // You may need to adjust this based on your requirements
          grade: row.grade || "", // Add the grade property to the family object
        }));

        const familyIds = familyList.map((family) => family.id);
        let count = 0;

        familyIds.forEach((familyID, index) => {
          const query = `SELECT first_name, last_name
                                   FROM youth_groups
                                            INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                            INNER JOIN families ON families.id = youth_groups.family_id
                                   WHERE family_id = ${familyID}`;

          db.query(query, (err, membersResult) => {
            if (err) {
              console.log(err);
              reject("Error retrieving family member list data");
            } else {
              const members = membersResult.map((row) => ({
                firstName: row.first_name,
                lastName: row.last_name,
              }));

              familyList[index].members = members;
              // Update the isFull property based on the number of members
              familyList[index].isFull =
                members.length >= familyList[index].capacity;
              count++;
              if (count === familyIds.length) {
                resolve(familyList);
              }
            }
          });
        });
      }
    });
  });

  const busListPromise = new Promise((resolve, reject) => {
    const busQuery = `SELECT id, name, capacity
                          FROM buses;`;
    db.query(busQuery, (err, busIdsResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving bus data");
      }

      const busIds = busIdsResult.map((row) => row.id);
      let busList = [];

      busIds.forEach((busId, index) => {
        const query = `SELECT first_name, last_name, name
                                   FROM youth_groups
                                            INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                            INNER JOIN buses ON buses.id = youth_groups.bus_id
                                   WHERE bus_id = ${busId}`;

        db.query(query, (err, membersResult) => {
          if (err) {
            console.log(err);
            reject("Error retrieving bus member list data");
          }

          const members = membersResult.map((row) => ({
            firstName: row.first_name,
            lastName: row.last_name,
          }));
          const isFull = members.length >= busIdsResult[index].capacity;

          busList[index] = {
            id: busId,
            name: busIdsResult[index].name,
            capacity: busIdsResult[index].capacity,
            members,
            isFull,
          };

          if (index === busList.length - 1) {
            resolve(busList);
          }
        });
      });
    });
  });

  const cabinListPromise = new Promise((resolve, reject) => {
    const cabinQuery = `SELECT id, name, capacity, gender
                            FROM cabins`;

    db.query(cabinQuery, (err, cabinResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving cabin data");
      } else {
        const cabinList = cabinResult.map((row) => ({
          id: row.id,
          name: row.name,
          capacity: row.capacity,
          members: [],
          isFull: false, // You may need to adjust this based on your requirements
          gender: row.gender || "", // Add the gender property to the cabin object
        }));

        const cabinIds = cabinList.map((cabin) => cabin.id);
        let count = 0;

        cabinIds.forEach((cabinId, index) => {
          const query = `SELECT first_name, last_name
                               FROM youth_groups
                                        INNER JOIN accounts ON accounts.id = youth_groups.youth_id
                                        INNER JOIN cabins ON cabins.id = youth_groups.cabin_id
                               WHERE cabin_id = ${cabinId}`;

          db.query(query, (err, membersResult) => {
            if (err) {
              console.log(err);
              reject("Error retrieving cabin member list data");
            } else {
              const members = membersResult.map((row) => ({
                firstName: row.first_name,
                lastName: row.last_name,
              }));

              cabinList[index].members = members;
              // Update the isFull property based on the number of members
              cabinList[index].isFull =
                members.length >= cabinList[index].capacity;
              count++;
              if (count === cabinIds.length) {
                resolve(cabinList);
              }
            }
          });
        });
      }
    });
  });

  Promise.all([familyListPromise, busListPromise, cabinListPromise])
    .then(([familyList, busList, cabinList]) => {
      if (familyList && busList && cabinList) {
        res.send({ familyList, busList, cabinList });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post("/api/creategroup", (req, res) => {
  const groupData = {
    groupType: req.body.groupType,
    groupName: req.body.groupName,
    groupCapacity: req.body.capacity,
    ...(req.body.groupType === "Cabin" && { gender: req.body.gender }),
    ...(req.body.groupType === "Family" && { grade: req.body.grade }),
  };

  // Perform validation checks
  // if (!groupData.groupType || !groupData.groupName || !groupData.groupCapacity) {
  //     return res.status(400).json({error: "Missing required fields"});
  // }

  // Get the last ID from the respective table and increment it by 1
  let selectQuery;
  let insertQuery;
  let insertParams;

  switch (groupData.groupType) {
    case "Family":
      selectQuery = "SELECT MAX(id) AS lastId FROM families";
      insertQuery =
        "INSERT INTO families (id, name, capacity, count, grade) VALUES (?, ?, ?, 0, ?)";
      insertParams = [
        null,
        groupData.groupName,
        groupData.groupCapacity,
        groupData.grade,
      ];
      break;
    case "Cabin":
      selectQuery = "SELECT MAX(id) AS lastId FROM cabins";
      insertQuery =
        "INSERT INTO cabins (id, name, capacity, count, gender) VALUES (?, ?, ?, 0, ?)";
      insertParams = [
        null,
        groupData.groupName,
        groupData.groupCapacity,
        groupData.gender,
      ];
      break;
    case "Bus":
      selectQuery = "SELECT MAX(id) AS lastId FROM buses";
      insertQuery =
        "INSERT INTO buses (id, name, capacity, count) VALUES (?, ?, ?, 0)";
      insertParams = [null, groupData.groupName, groupData.groupCapacity];
      break;
    default:
      return res.status(400).json({ error: "Invalid group type" });
  }

  // Execute the select query to get the last ID
  db.query(selectQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to create group" });
    }

    let lastId = 0;
    if (result.length > 0 && result[0].lastId) {
      lastId = parseInt(result[0].lastId);
    } else {
      // Assign a default starting value if the result is null or empty
      lastId = 0;
    }

    // Increment the last ID by 1
    const newId = lastId + 1;

    // Update the insertParams with the generated ID
    insertParams[0] = newId;

    // Execute the insert query
    db.query(insertQuery, insertParams, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Failed to create group" });
      }

      // Group created successfully
      res.send({ message: "Group created successfully", groupId: newId });
    });
  });
});

app.put("/api/editgroup/:groupId", (req, res) => {
  const groupId = req.params.groupId;
  const groupData = {
    groupType: req.body.groupType,
    groupName: req.body.groupName,
    groupCapacity: req.body.capacity,
    ...(req.body.groupType === "Cabin" && { gender: req.body.gender }),
    ...(req.body.groupType === "Family" && { grade: req.body.grade }),
  };

  // Update the group in the database
  let updateQuery;
  let updateParams;

  switch (req.body.groupType) {
    case "Family":
      updateQuery =
        "UPDATE families SET name = ?, capacity = ?, grade = ? WHERE id = ?";
      updateParams = [
        groupData.groupName,
        groupData.groupCapacity,
        groupData.grade,
        groupId,
      ];
      break;
    case "Cabin":
      updateQuery =
        "UPDATE cabins SET name = ?, capacity = ?, gender = ? WHERE id = ?";
      updateParams = [
        groupData.groupName,
        groupData.groupCapacity,
        groupData.gender,
        groupId,
      ];
      break;
    case "Bus":
      updateQuery = "UPDATE buses SET name = ?, capacity = ? WHERE id = ?";
      updateParams = [groupData.groupName, groupData.groupCapacity, groupId];
      break;
    default:
      return res.status(400).json({ error: "Invalid group type" });
  }

  // Execute the update query
  db.query(updateQuery, updateParams, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to update group" });
    }

    // Group updated successfully
    res.send({ message: "Group updated successfully" });
  });
});

app.delete("/api/deletegroup/:groupId", (req, res) => {
  const groupId = req.params.groupId;
  const groupType = req.body.groupType;
  // Perform the deletion operation based on the group type
  let deleteQuery;
  let tableName;

  switch (groupType) {
    case "Family":
      tableName = "families";
      break;
    case "Cabin":
      tableName = "cabins";
      break;
    case "Bus":
      tableName = "buses";
      break;
    default:
      return res.status(400).json({ error: "Invalid group type" });
  }

  deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;

  db.query(deleteQuery, [groupId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete group" });
    }

    // Check if any rows were affected by the delete operation
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Group deleted successfully
    res.json({ message: "Group deleted successfully" });
  });
});

app.post("/api/groupselection", (req, res) => {
  const youthID = req.body.youthID;
  const familyID = req.body.familyID;
  const busID = req.body.busID;
  const cabinID = req.body.cabinID;

  const checkQuery = `SELECT *
                        FROM youth_groups
                        WHERE youth_id = '${youthID}';`;
  db.query(checkQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      if (result.length === 0) {
        // If youth_id does not exist, insert a new row with the selected group information
        const insertQuery = `INSERT INTO youth_groups (youth_id, family_id, bus_id, cabin_id)
                                     VALUES ('${youthID}',${familyID},${busID},${cabinID})`;
        db.query(insertQuery, (err, result) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            if (result.length === 0) {
              // If youth_id does not exist, insert a new row with the selected group information
              const insertQuery = `INSERT INTO youth_groups (youth_id, family_id, bus_id, cabin_id)
                                     VALUES ('${youthID}', ${familyID}, ${busID}, ${cabinID})`;
              db.query(insertQuery, (err, result) => {
                if (err) {
                  console.log(err);
                  res.sendStatus(500);
                } else {
                  console.log(result);
                  res.sendStatus(200);
                }
              });
            } else {
              // If youth_id exists, update the existing row with the selected group information
              const updateQuery = `UPDATE youth_groups
                                     SET bus_id    = ${busID},
                                         family_id = ${familyID},
                                         cabin_id  = ${cabinID}
                                     WHERE youth_id = '${youthID}'`;

              db.query(updateQuery, (err, result) => {
                if (err) {
                  console.log(err);
                  res.sendStatus(500);
                } else {
                  res.sendStatus(200);
                }
              });
            }
          }
        });
      }
    }
  });
});

app.post("/api/getYouthData", (req, res) => {
  let parentID = req.body.parent_id;
  let youthInfo = [];
  let parentDetailsCompleted = false;
  let balance = 0;
  let financialAid = false;
  db.query(
    "SELECT * FROM accounts WHERE id IN (SELECT youth_id FROM youth WHERE parent_id = ?)",
    [parentID],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          youthInfo.push({
            youth_id: result[i].youth_id,
            firstName: result[i].first_name,
            lastName: result[i].last_name,
          });
        }
      }
    }
  );
});

app.post("/api/enterSurvey", (req, res) => {
  const {
    youthID,
    shirtSize,
    spirituality,
    knowledge,
    improvement,
    community,
    file,
    hopes,
    question,
    activity,
    submitted_at,
  } = req.body;
  const submission_time = formatDate(submitted_at, true);
  db.query(
    `INSERT INTO youth_responses(youth_id, shirt_size, spirituality, knowledge, improvement, community, question, preferred_activity, hopes, image_file, submitted_at)
    VALUES('${youthID}', '${shirtSize}', '${spirituality}','${knowledge}','${improvement}','${community}','${question}','${activity}','${hopes}','${file}', '${submission_time}')`,
    (err) => {
      if (err) console.log(err);
      res.send({ message: "Survey response recorded!" });
    }
  );
});

app.get("/api/getRoster", (req, res) => {
  db.query(
    `SELECT youth.first_name as 'First Name',youth.last_name as 'Last Name',youth.birthday as 'DOB',youth.phone_number as 'Phone #', 
  youth.gender as 'Gender',youth.grade as 'Grade',youth.survey_completed as 'Survey Completed',CONCAT_WS(' ', parents.first_name, parents.last_name) as 'Parent', 
  parents.birthday as 'Parent DOB',parents.balance as 'Balance', parents.phone_number as 'Parent Phone #', parents.address_street as 'Address', 
  parents.address_city as 'City',parents.address_zip as 'Zip Code',parents.ec_name1 as 'Emergency Contact 1 Name',parents.ec_phone1 as 'Emergency Contact 1 Phone #',
  parents.ec_relation1 as 'Emergency Contact 1 Relation',parents.ec_name2 as 'Emergency Contact 2 Name',parents.ec_phone2 as 'Emergency Contact 2 Phone #',
  parents.ec_relation2 as 'Emergency Contact 2 Relation', parents.insurance_provider as 'Insurance Provider', parents.insurance_policy_holder as 'Insurance Policy Holder',
  parents.insurance_policy_number as 'Insurance Policy Number', parents.credit as 'Credit'
  FROM youth, parents
  WHERE youth.parent_id = parents.parent_id;`,
    (err, result) => {
      if (err) res.send({ message: "error", error: err });
      if (result) res.send(result);
    }
  );
});

app.post("/api/createEvent", (req, res) => {
  const {
    eventName,
    date,
    startTime,
    startPeriod,
    endTime,
    endPeriod,
    location,
    assigned_families,
  } = req.body;
  let formattedDate = formatDate(date);
  db.query(
    `INSERT INTO events (name, date, start_time, start_period, end_time, end_period, location) 
            VALUES('${eventName}','${formattedDate}','${startTime}','${startPeriod}','${endTime}','${endPeriod}','${location}')`,
    (err) => {
      if (err) {
        console.log(err);
        res.send({ message: `Error: ${err}` });
      }
      if (assigned_families && assigned_families.length > 0) {
        db.query("SELECT LAST_INSERT_ID();", (err2, result2) => {
          if (err2) {
            console.log(err2);
            res.send({ message: `Error: ${err2}` });
          }
          if (result2 && result2.length > 0) {
            let query =
              "INSERT INTO event_assignments (family_id, event_id) VALUES ";
            assigned_families.forEach((familyID, i) => {
              query += `(${familyID}, ${result2[0]["LAST_INSERT_ID()"]})`;
              if (i != assigned_families.length - 1) {
                query += ", ";
              }
            });
            db.query(query, (err3) => {
              if (err3) {
                console.log(err3);
                res.send({ message: `Error: ${err3}` });
              }
              res.send({ message: "Event created!" });
            });
          }
        });
      } else {
        res.send({ message: "Event created!" });
      }
    }
  );
});

app.get("/api/programInfo", (req, res) => {
  let events = [];
  let prices = [];
  let families = [];
  let event_assignments = [];
  db.query("SELECT * FROM events", (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: `Error: ${err}` });
    }
    if (result && result.length > 0) {
      events = result;
    }
    db.query("SELECT * FROM prices", (err2, result2) => {
      if (err2) {
        console.log(err2);
        res.send({ message: `Error: ${err2}` });
      }
      if (result2 && result2.length > 0) {
        prices = result2;
      }
      db.query("SELECT * FROM families", (err3, result3) => {
        if (err3) {
          console.log(err3);
          res.send({ message: `Error: ${err3}` });
        }
        if (result3 && result3.length > 0) {
          families = result3;
        }
        db.query("SELECT * FROM event_assignments", (err4, result4) => {
          if (err4) {
            console.log(err4);
            res.send({ message: `Error: ${err4}` });
          }
          if (result4 && result4.length > 0) {
            event_assignments = result4;
          }
          res.send({ events, prices, families, event_assignments });
        });
      });
    });
  });
});

app.post("/api/deleteEvent", (req, res) => {
  const event_id = req.body.eventID;
  db.query(`DELETE FROM events WHERE event_id = '${event_id}'`, (err) => {
    if (err) {
      console.log(err);
      res.send({ message: `Error: ${err}` });
    }
    res.send({ message: "Event deleted!" });
  });
});

app.post("/api/createPrice", (req, res) => {
  const { type, price } = req.body;
  db.query(
    `INSERT INTO prices (type, price) VALUES ('${type}','${price}')`,
    (err) => {
      if (err) {
        console.log(err);
        res.send({ message: `Error: ${err}` });
      }
      res.send({ message: "Price created!" });
    }
  );
});

app.post("/api/deletePrice", (req, res) => {
  const price_id = req.body.priceID;
  db.query(`DELETE FROM prices WHERE price_id = '${price_id}'`, (err) => {
    if (err) {
      console.log(err);
      res.send({ message: `Error: ${err}` });
    }
    res.send({ message: "Price deleted!" });
  });
});

app.post("/api/activatePrice", (req, res) => {
  const price_id = req.body.priceID;
  db.query(
    `UPDATE prices SET active = 1 WHERE price_id = '${price_id}'`,
    (err) => {
      if (err) {
        console.log(err);
        res.send({ message: `Error: ${err}` });
      }
      db.query(
        `UPDATE prices SET active = 0 WHERE price_id <> '${price_id}'`,
        (err2) => {
          if (err2) {
            console.log(err2);
            res.send({ message: `Error : ${err2}` });
          }
          res.send({ message: "Price activated!" });
        }
      );
    }
  );
});

app.post("/api/counselorData", (req, res) => {
  db.query(
    "SELECT first_name, last_name, counselor_id, phone_number, gender, shirt_size, birthday, city, review_status FROM counselors where review_status is NULL;",
    (err, result) => {
      if (err) console.log(err);
      const results = [];
      if (result.length > 0) {
        const results = [];
        for (var x = 0; x <= result.length - 1; x++) {
          var birthdayFormat = new Date(result[x].birthday);
          var phonenumberFormat =
            "(" +
            result[x].phone_number.substring(0, 3) +
            ")" +
            result[x].phone_number.substring(3, 6) +
            "-" +
            result[x].phone_number.substring(6, 10);
          var genderFormat = "";
          if (result[x].gender == "m") {
            genderFormat = "Male";
          } else {
            genderFormat = "Female";
          }
          var shirtFormat = "";
          if (result[x].shirt_size == "S") {
            shirtFormat = "Small";
          } else if (result[x].shirt_size == "M") {
            shirtFormat = "Medium";
          } else {
            shirtFormat = "Large";
          }
          results.push({
            first_name: result[x].first_name,
            last_name: result[x].last_name,
            counselorid: result[x].counselor_id,
            phone_number: phonenumberFormat,
            gender: genderFormat,
            shirt_size: shirtFormat,
            birthday: birthdayFormat.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            city: result[x].city,
          });
        }
        res.send({ data: results });
      }
    }
  );
});

app.post("/api/approvedCounselors", (req, res) => {
  db.query(
    'SELECT first_name, last_name, counselors.counselor_id, review_status, counselors.gender as gender, buses.name as bus, families.name as family, cabins.name as cabin FROM counselors left join counselor_groups on counselors.counselor_id = counselor_groups.counselor_id left join buses on bus=buses.id left join families on family=families.id left join cabins on cabin = cabins.id where review_status = "Accepted"',
    (err, result) => {
      if (err) console.log(err);
      const results = [];
      if (result.length > 0) {
        const results = [];
        for (var x = 0; x <= result.length - 1; x++) {
          results.push({
            first_name: result[x].first_name,
            last_name: result[x].last_name,
            counselorid: result[x].counselor_id,
            gender: result[x].gender,
            bus_name: result[x].bus,
            family_name: result[x].family,
            cabin_name: result[x].cabin,
          });
        }
        res.send({ data: results });
      }
    }
  );
});

app.post("/api/changeCounselorStatus", (req, res) => {
  const status = req.body.status;
  const counselorid = req.body.counselorid;
  db.query(
    `UPDATE counselors SET review_status = "${status}" WHERE counselor_id = "${counselorid}"`,
    (err) => {
      if (err) console.log(err);
      res.send({ message: "Counselor Status Changed" });
    }
  );
});

app.get("/api/counselorExport", (req, res) => {
  db.query(
    "SELECT first_name, last_name, counselor_id, phone_number, gender, shirt_size, birthday, city, review_status FROM newYss.counselors",
    (err, results) => {
      if (err) console.log(err);

      var counselorData = JSON.parse(JSON.stringify(results));
      var fileHeader = [
        "first_name",
        "last_name",
        "counselor_id",
        "phone_number",
        "gender",
        "shirt_size",
        "birthday",
        "city",
        "review_status",
      ];
      var jsonData = new data_exporter({ fileHeader });
      var csvData = jsonData.parse(counselorData);
      console.log(csvData);

      // res.setHeader("Content-Type", "text/csv");
      // res.setHeader("Content-Disposition", "attachment; filename=sample_data.csv");
      // res.status(200).end(csvData)
      res.json(JSON.stringify(results));
    }
  );
});

app.post("/api/listGroups", (req, res) => {
  const familyListPromise = new Promise((resolve, reject) => {
    const initialQuery = `SELECT *
                              FROM families`;

    db.query(initialQuery, (err, familyResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving family data");
      } else {
        resolve(familyResult);
      }
    });
  });

  const busListPromise = new Promise((resolve, reject) => {
    const initialQuery = `SELECT *
                              FROM buses`;

    db.query(initialQuery, (err, busResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving family data");
      } else {
        resolve(busResult);
      }
    });
  });

  const cabinListPromise = new Promise((resolve, reject) => {
    const initialQuery = `SELECT *
                              FROM cabins`;

    db.query(initialQuery, (err, cabinResult) => {
      if (err) {
        console.log(err);
        reject("Error retrieving family data");
      } else {
        resolve(cabinResult);
      }
    });
  });

  Promise.all([familyListPromise, busListPromise, cabinListPromise])
    .then(([familyList, busList, cabinList]) => {
      res.send({ familyList, busList, cabinList });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

app.post("/api/assignCounselor", (req, res) => {
  const counselorID = req.body.counselorid;
  const busID = req.body.busID;
  const cabinID = req.body.cabinID;
  const familyID = req.body.familyID;

  db.query(
    "Update counselor_groups set bus=?, cabin=?, family=? where counselor_id=?",
    [parseInt(busID), cabinID, familyID, counselorID],
    (err) => {
      if (err) console.log(err);
      res.send({ message: "Counselor has been assigned groups." });
    }
  );
});

app.post("/api/getAdminInfo", (req, res) => {
  const adminID = req.body.adminID;
  db.query(`SELECT * FROM accounts WHERE id = '${adminID}'`, (err, result) => {
    if (err) {
      console.log(err);
      res.send({ message: `Error: ${err}` });
    }
    if (result) {
      res.send({ adminInfo: result[0] });
    }
  });
});

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("/", (req, res) => {
  res.send("Path does not exist");
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
