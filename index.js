const inquirer = require("inquirer");
const { Pool } = require("pg");
const { SQLQuery, SQLAddDepQuery } = require("./queries/query");

// Above I require three packages and my constructor class with functions for queries.

const pool = new Pool(
  {
    user: "postgres",
    password: "Abdul7293%",
    host: "localhost",
    database: "west_region_db",
  },
  console.log("Connected to the west_region_db database!")
);

const sqlQuery = new SQLQuery(pool);
const departments = ["Human Resources", "Stow", "Pick", "AFM", "Ship Dock"];

// Above, I create a new instance of my object

pool.connect();

// Above, I connect my pool object to my db.

const questions = [
  {
    type: "list",
    name: "choice",
    message: "What would You like to do?",
    choices: [
      "View All Departments",
      "View All Roles",
      "View All Employees",
      "Add A Depertment",
    ],
  },

  {
    type: "input",
    name: "departmentName",
    message: "Please enter the department name:",
    when: (answers) => answers.choice === "Add A Depertment",
    // Above is the when method of inquerier that prompts another question based on a previous question answer.
  },
];

// Above is the first question the user will see.

function intit() {
  inquirer.prompt(questions).then((data) => {
    const choice = data.choice;
    const department_name = data.departmentName;


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

      case "Add A Depertment":
        const existingDepartment = departments.find(
          (department) => department === department_name
        );
        if (existingDepartment) {
          console.log("Department already in use!");
          process.exit()
          
        }

        departments.push(department_name);

        let SqlAddDepQ = new SQLAddDepQuery(pool, department_name);

        SqlAddDepQ.addDepartment()
          .then(() => {
            console.log("New Department added!");
            SqlAddDepQ.close();
          })

          .catch((error) => {
            console.error("Error executing Add departments query:", error);
            SqlAddDepQ.close();
          });
        break;

      default:
        console.log("Invalid choice.");
        break;
    }
  });
}

intit();
