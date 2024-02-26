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

async function checkVisited() {
  let code = [];

  try {
    const result = await db.query("SELECT country_code FROM visited_countries");
    
    const countries = result.rows;
    
    countries.forEach((count) => {
      code.push(count.country_code);
    });

    // To see if the data is fetched properly.
    //console.log(code);

    return code;
  } catch (err) {
    console.error("Error executing database query:", err);

    res.status(500).send("Internal Server Error");
  }
}

app.get("/", async (req, res) => {
  
      let country = await checkVisited(); 
        // See if the country code is properly returned from the checkVisited() function 
      //console.log({ countries: country, total: country.length });
      res.render("index.ejs", { countries: country, total: country.length }); 
    })



app.post("/add", async (req, res) => { 
    // Get the imput field
  const input = req.body["country"];

  try {
    // get the country code from on table
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      // see if you can input the value onto the table, the Country_name is suppose to be not null unique
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisited();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisited();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
})


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
