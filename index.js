import express from "express";
import bodyParser from "body-parser";
import pg from "pg"; 

const app = express();
const port = 3001;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "#Sunset123",
  port: 5432,
});

db.connect((err) => { 
  if(err){
    console.log("There is an error within the connection")
  } else { 
    console.log("The connection is successful")
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted(){ 


  
}

app.get("/", async (req, res) => {
  db.query("SELECT country_code FROM visited_countries", (err, result) => { 
    if (err) { 
      console.error("Error executing database query:", err);
      // status code 5XX is Server related 
      res.status(500).send("Internal Server Error");
    } else { 
      const countries = result.rows;
      let code = []; 
      countries.forEach((count) => { 
        code.push(count.country_code)
      })


      // console.log({ countries: countries, total: countries.length });
      res.render("index.ejs", { countries: code, total: code.length }); 
    }
  });
});


app.post("/add", async (req, res) => { 
   
  let input = req.body.country; 
  // How we get the values
  const code =  await db.query("Select country_code FROM countries WHERE country_name = $1", [input])


  // we need to insert the value onto the visited_countries
  console.log(code.rows[0].country_code); 

   await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [code.rows[0].country_code], (err, res)=> { 

    if(err){ 
      res.status(500).send("There is an error within the server ")
    } 
   }); 
   res.redirect("/");

})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
