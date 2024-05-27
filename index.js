require("dotenv").config();
const inquirer = require("inquirer");
const { Pool } = require("pg");
const {
  SQLQuery,
  SQLAddDepQuery,
  SQLAddRoleQuery,
  SQLAddEmployeeQuery,
  UpdateEmployeeRoleQuery,
  UpdateEmployeeManagerQuery,
  SQLDeleteQuery,
} = require("./queries/query");

// Above I require four packages and my constructor class with functions for queries.

const pool = new Pool(
  {
    user: process.env.db_USER,
    password: process.env.db_PASSWORD,
    host: process.env.db_host,
    database: process.env.db_data_base,
  },
  console.log("Connected to the west_region_db database!")
);

// Above, I added my credentials from my .env file and console log if I am sucessfully added to the db.

const sqlQuery = new SQLQuery(pool);
// Above, I create a new instance of my object.

const departments = ["Human Resources", "Stow", "Pick", "AFM", "Ship Dock"];

const roles = [
  "Associate",
  "Area Manager",
  "Hr Manager",
  "Operations Manager",
  "Senior Manager",
];

let tableToDeleteFromLower;

// Above, I create a array with the already exisitng departments and roles that I will later spread too.
// Also, we create a instance of a lower case version of our table we want to delete from for part of our delete request.

pool.connect();

// Above, I connect my pool object to my db.

async function fetchDepartmentsFromDatabase() {
  try {
    const result = await sqlQuery.executeDepartments();
    const departmentsFromDatabase = result.rows.map((row) => row.name);
    departments.splice(0, departments.length, ...departmentsFromDatabase);
    const departmentIndex = result.rows.map((row) => ({
      name: row.name,
      value: row.id,
    }));
    return departmentIndex;
  } catch (error) {
    console.error("Error fetching departments from database:", error);
  }
}

async function fetchRolesFromDatabase() {
  try {
    const result = await sqlQuery.allRoles();
    const rolesFromDatabase = result.rows.map((row) => row.title);
    roles.splice(0, roles.length, ...rolesFromDatabase);
    const rolesIndex = result.rows.map((row) => ({
      name: row.title,
      value: row.id,
    }));
    return rolesIndex;
  } catch (error) {
    console.error("Error fetching departments from database:", error);
  }
}

async function fetchemployeesFromDatabase() {
  try {
    const result = await sqlQuery.allEmployess();

    const employeeIndex = result.rows.map((row) => ({
      name: `${row.first_name} ${row.last_name}`,
      value: row.id,
    }));
    employeeIndex.push({ name: "None", value: null });
    // Above, I push a null value to the end of the array in case the employee does not have a manager.
    return employeeIndex;
  } catch (error) {
    console.error("Error fetching employees from database:", error);
  }
}

// Above, are async functions that updates our departments and roles array with a spred and gets the index of the department.
// I am able to use async because I am preforming a query that returns a promise. If not I would need make a new promise function.
// Both objectives are completed with the map method.

const questions = [
  {
    type: "list",
    name: "choice",
    message: "What would You like to do?",
    choices: [
      "View All Departments",
      "View All Roles",
      "View All Employees",
      "View Employee By Manager",
      "View Employee By Department",
      "View combined Salary in each Department",
      "Add A Department",
      "Add A Role",
      "Add A Employee",
      "Update Employee role",
      "Update Employee Manager",
      "Delete Request",
    ],
  },

  {
    type: "input",
    name: "departmentName",
    message: "Please enter the department name:",
    validate: function (input) {
      if (input.trim() === "") {
        return "Please enter a new department name!";
      }
      return true;
    },

    when: (answers) => answers.choice === "Add A Department",
    // Above is the when method of inquerier that prompts another question based on a previous question answer.
  },

  {
    type: "input",
    name: "roleName",
    message: "Please enter the Role name:",
    validate: function (input) {
      if (input.trim() === "") {
        return "Please enter a new Role name!";
      }

      const existingrole = roles.find((role) => role === input);
      if (existingrole) {
        console.log(" Role already in use!");
        process.exit();
      }

      return true;
    },
    when: (answers) => answers.choice === "Add A Role",

    // Above is the when method of inquerier that prompts another question based on a previous question answer.
  },

  {
    type: "input",
    name: "roleSalary",
    message: "Please enter the Role salary:",
    validate: function (input) {
      if (input.trim() === "") {
        return "Please enter a valid Salary!";
      }

      if (isNaN(input)) {
        return "Please enter a valid Salary!";
      }
      return true;
    },
    when: (answers) => answers.choice === "Add A Role",
  },

  {
    type: "list",
    name: "departmentID",
    message: "Please pick the department this role is assigned to:",
    choices: async () => await fetchDepartmentsFromDatabase(),
    // Above we call our function with async and await becuase it is a async function that returns a promise.
    // This instance is being used because the function is within the choices object.
    when: (answers) => answers.choice === "Add A Role",
  },

  {
    type: "input",
    name: "employeeFirst",
    message: "Please enter the employee first name:",
    validate: function (input) {
      if (input.trim() === "") {
        return "Please enter the employee First name!";
      }
      return true;
    },

    when: (answers) => answers.choice === "Add A Employee",
  },

  {
    type: "input",
    name: "employeeLast",
    message: "Please enter the employee Last name:",
    validate: function (input) {
      if (input.trim() === "") {
        return "Please enter the employee last name!";
      }
      return true;
    },

    when: (answers) => answers.choice === "Add A Employee",
  },

  {
    type: "list",
    name: "employeeRole",
    message: "What is the employee role:",
    choices: async () => await fetchRolesFromDatabase(),
    // Above we call our function with async and await becuase it is a async function that returns a promise.
    // This instance is being used because the function is within the choices object.
    when: (answers) => answers.choice === "Add A Employee",
  },

  {
    type: "list",
    name: "employeeManager",
    message: "Who is the employee manager:",
    choices: async () => await fetchemployeesFromDatabase(),
    when: (answers) => answers.choice === "Add A Employee",
  },

  {
    type: "list",
    name: "employeeRoleUpdateId",
    message: "Which employees role would you like to update:",
    choices: async () => await fetchemployeesFromDatabase(),
    when: (answers) => answers.choice === "Update Employee role",
  },

  {
    type: "list",
    name: "employeeNewRoleId",
    message: "What is the employees new role:",
    choices: async () => await fetchRolesFromDatabase(),
    when: (answers) => answers.choice === "Update Employee role",
  },

  {
    type: "list",
    name: "employeeManagerUpdateId",
    message: "Which employees manager would you like to update:",
    choices: async () => await fetchemployeesFromDatabase(),
    when: (answers) => answers.choice === "Update Employee Manager",
  },

  {
    type: "list",
    name: "employeeNewManagerId",
    message: "Who is the employees new manager:",
    choices: async () => await fetchemployeesFromDatabase(),
    when: (answers) => answers.choice === "Update Employee Manager",
  },

  {
    type: "list",
    name: "deleteTable",
    message: "Please pick where you want to delete from:",
    choices: ["Department", "Role", "Employee"],
    when: (answers) => answers.choice === "Delete Request",
  },

  {
    type: "list",
    name: "deleteIndex",
    message: "Please pick what Department you want to delete:",
    choices: async () => await fetchDepartmentsFromDatabase(),
    when: (answers) => answers.deleteTable === "Department",
  },

  {
    type: "list",
    name: "deleteIndex",
    message: "Please pick what Role you want to delete:",
    choices: async () => await fetchRolesFromDatabase(),
    when: (answers) => answers.deleteTable === "Role",
  },

  {
    type: "list",
    name: "deleteIndex",
    message: "Please pick what Employee you want to delete:",
    choices: async () => await fetchemployeesFromDatabase(),
    when: (answers) => answers.deleteTable === "Employee",
  },
];

function intit() {
  fetchDepartmentsFromDatabase();
  fetchRolesFromDatabase();
  fetchemployeesFromDatabase();
  inquirer
    .prompt(questions)
    //Above we call our async functions normally and us inquirer after without a .then becuase our function returns a promise.
    .then((data) => {
      const choice = data.choice;
      // Above, I prompt the question and assign the input to a variable named choice.

      // Above is the inital choice recieved
      const departmentName = data.departmentName;
      // ABove is the variable for adding a department
      const roleName = data.roleName;
      const roleSalary = data.roleSalary;
      const depID = data.departmentID;
      // ABove are all the variables for adding a role

      const employeeFirst = data.employeeFirst;
      const employeeLast = data.employeeLast;
      const employeeRole = data.employeeRole;
      const employeeManager = data.employeeManager;

      // Above, are all my variables for adding a employee.

      const employeeRoleUpdateid = data.employeeRoleUpdateId;
      const employeeNewROLE = data.employeeNewRoleId;
      // Above, are the variables for updating a employee role

      let employeeManagerUpdateId = data.employeeManagerUpdateId;
      let employeeNewManagerId = data.employeeNewManagerId;

      // Above, are the variables for updating a employee Manager

      let tableToDeleteFrom = data.deleteTable;
      let deleteIndex = data.deleteIndex;

      // Above, are the variables for a delete request

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

        case "View Employee By Manager":
          sqlQuery
            .employeesByManager()
            .then((result) => {
              console.table(result.rows);
              sqlQuery.close();
            })
            .catch((error) => {
              console.error(
                "Error executing employee by manager query:",
                error
              );
              sqlQuery.close();
            });
          break;

        case "View Employee By Department":
          sqlQuery
            .employeesByDepartment()
            .then((result) => {
              console.table(result.rows);
              sqlQuery.close();
            })
            .catch((error) => {
              console.error(
                "Error executing employee by department query:",
                error
              );
              sqlQuery.close();
            });
          break;

        case "View combined Salary in each Department":
          sqlQuery
            .departmentSalaryTotal()
            .then((result) => {
              console.table(result.rows);
              sqlQuery.close();
            })
            .catch((error) => {
              console.error(
                "Error executing department total salary query:",
                error
              );
              sqlQuery.close();
            });
          break;

        case "Add A Department":
          const existingDepartment = departments.find(
            (department) => department === departmentName
          );
          if (existingDepartment) {
            console.log("Department already in use!");
            process.exit();
          }
          // Above, is where we check if a department already exists before creating it. This is why we use the departments array.
          let SqlAddDepQ = new SQLAddDepQuery(pool, departmentName);

          SqlAddDepQ.addDepartment()
            .then(() => {
              console.log("New Department added!");
              SqlAddDepQ.close();
            })
            // Above we create a new add object and call the addDepartmet method on it.
            .catch((error) => {
              console.error("Error executing Add departments query:", error);
              SqlAddDepQ.close();
            });
          break;

        case "Add A Role":
          const existingRole = roles.find((role) => role === roleName);
          if (existingRole) {
            console.log("Role already in use!");
            process.exit();
          }

          let SqlAddRoleQ = new SQLAddRoleQuery(
            pool,
            roleName,
            roleSalary,
            depID
          );

          SqlAddRoleQ.addRole()
            .then(() => {
              console.log("New Role added!");
              SqlAddRoleQ.close();
            })
            // Above we create a new add object and call the addRole method on it.

            .catch((error) => {
              console.error("Error executing Add departments query:", error);
              SqlAddRoleQ.close();
            });

          break;

        case "Add A Employee":
          let SqlAddemployeeQ = new SQLAddEmployeeQuery(
            pool,
            employeeFirst,
            employeeLast,
            employeeRole,
            employeeManager
          );

          SqlAddemployeeQ.addEmployee()
            .then(() => {
              console.log("New employee added!");
              SqlAddemployeeQ.close();
            })
            // Above we create a new add object and call the addEmployee method on it.

            .catch((error) => {
              console.error("Error executing Add employee query:", error);
              SqlAddemployeeQ.close();
            });

          break;

        case "Update Employee role":
          if (employeeRoleUpdateid === null) {
            console.log("No Employee Chosen, No Update Made!");
            process.exit();
          }
          // Above, is to notify the user that no update was made due to no employee being chosen.

          let SqlUpdateRoleQ = new UpdateEmployeeRoleQuery(
            pool,
            employeeRoleUpdateid,
            employeeNewROLE
          );

          SqlUpdateRoleQ.upDateEmployeeRole()
            .then(() => {
              console.log("Updated Employee Role!");
              SqlUpdateRoleQ.close();
            })
            // Above we create a new add object and call the addEmployee method on it.

            .catch((error) => {
              console.error("Error executing Add employee query:", error);
              SqlUpdateRoleQ.close();
            });

          break;

        case "Update Employee Manager":
          // Above, is where we check if a department already exists before creating it. This is why we use the departments array.

          if (employeeManagerUpdateId === null) {
            console.log("No Employee Chosen, No Update Made!");
            process.exit();
          }
          // Above, is to notify the user that no update was made due to no employee being chosen.

          let SqlUpdateManagerQ = new UpdateEmployeeManagerQuery(
            pool,
            employeeManagerUpdateId,
            employeeNewManagerId
          );

          SqlUpdateManagerQ.upDateEmployeeManager()
            .then(() => {
              console.log("Updated Employee Manager!");
              SqlUpdateManagerQ.close();
            })
            // Above we create a new add object and call the addEmployee method on it.

            .catch((error) => {
              console.error("Error executing Add employee query:", error);
              SqlUpdateManagerQ.close();
            });

          break;

        case "Delete Request":
          if (tableToDeleteFrom) {
            tableToDeleteFromLower = tableToDeleteFrom.toLowerCase();
          }

          // Above, is to check if a table input exists and change that to lowercase.

          let SqlDeleteQ = new SQLDeleteQuery(
            pool,
            tableToDeleteFromLower,
            deleteIndex
          );

          SqlDeleteQ.deleteRecordById()
            .then(() => {
              console.log("Delete Request Successfull!");
              SqlDeleteQ.close();
            })
            // Above we create a new add object and call the deleteRecordByID method on it.

            .catch((error) => {
              console.error("Error executing Add employee query:", error);
              SqlDeleteQ.close();
            });

          break;

        default:
          console.log("Invalid choice.");
          break;
      }
    })
    .catch((error) => {
      console.error("Error data from questions not recieved:", error);
      SqlDeleteQ.close();
    });
}

intit();
