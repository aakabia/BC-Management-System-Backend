const inquirer = require("inquirer");
const { Pool } = require("pg");
const SQLQuery = require("./queries/query");

// Above I require two packages and my constructor class with functions for queries.

const sqlQuery = new SQLQuery();

// Above, I create a new instance of my object

sqlQuery.pool.connect();

// Above, I use the pool property and connect methid to connect to my db.

const questions = [
  {
    type: "list",
    name: "choice",
    message: "What would You like to do?",
    choices: ["View All Departments", "View All Roles", "View All Employees"],
  },
];

// Above is the first question the user will see.

function intit() {
  inquirer.prompt(questions).then((data) => {
    const choice = data.choice;

    // Above, I prompt the question and assign the input to a variable named choice.

    switch (choice) {
      case "View All Departments":
        sqlQuery
          .executeDepartments()
          .then((result) => {
            console.table(result.rows);
            sqlQuery.close();
          })
          .catch((error) => {
            console.error("Error executing departments query:", error);
            sqlQuery.close();
          });
        break;
      // Above, Is a switch statment that changes on the choice, then calls the related query to that choice, then closes the db after that choice.
      // The same is repeated for other choices.
      // Also, we are using console.table to return the display back to the  in table format.
      case "View All Roles":
        sqlQuery
          .executeRoles()
          .then((result) => {
            console.table(result.rows);
            sqlQuery.close();
          })
          .catch((error) => {
            console.error("Error executing departments query:", error);
            sqlQuery.close();
          });
        break;

      case "View All Employees":
        sqlQuery
          .executeemployee()
          .then((result) => {
            console.table(result.rows);
            sqlQuery.close();
          })
          .catch((error) => {
            console.error("Error executing departments query:", error);
            sqlQuery.close();
          });
        break;

      default:
        console.log("Invalid choice.");
        break;
    }
  });
}

intit();
