const { Pool } = require("pg");

// Above, I require the pool object from pg.



class SQLQuery {
  constructor() {
    this.pool = new Pool(
        {
          
          user: "postgres",
          password: "Abdul7293%",
          host: "localhost",
          database: "west_region_db",
        },
        console.log("Connected to the west_region_db database!")
      );;
  }
// Above, I make a pool object with my log in info.

  executeDepartments() {
    return this.pool.query("SELECT * FROM department").catch(error => {
        console.error("Error executing query:", error);
        throw error;
      });
    }
  // Above is a function in the object that returns the depatment table.
    executeRoles(){
        return this.pool.query("SELECT * FROM role").catch(error => {
            console.error("Error executing query:", error);
            throw error;
          });

    }
    // Above is a function in the object that returns the role table.
    executeemployee(){
        return this.pool.query("SELECT * FROM employee").catch(error => {
            console.error("Error executing query:", error);
            throw error;
          });
    }
    // Above is a function in the object that returns the employee table.


    close() {
        this.pool.end();
        console.log("Database connection closed.");
        process.exit();
    }
     
    // Above, is a function that closes the db and exists back to the terminal. 
}

module.exports = SQLQuery