require("dotenv").config();
const inquirer = require("inquirer");
const { Pool } = require("pg");
const {
  SQLQuery,
  SQLAddDepQuery,
  SQLAddRoleQuery,
  SQLAddEmployeeQuery,
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

// Above, I create a array with the already exisitng departments and roles that I will later spread too.

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
    employeeIndex.push({ name: "No Manager Assigned", value: null });
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
      "Add A Department",
      "Add A Role",
      "Add A Employee",
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
          // Above, is where we check if a department already exists before creating it. This is why we use the departments array.

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
          // Above, is where we check if a department already exists before creating it. This is why we use the departments array.

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

        default:
          console.log("Invalid choice.");
          break;
      }
    });
}

intit();
