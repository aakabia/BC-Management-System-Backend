class SQLQuery {
  constructor(pool) {
    this.pool = pool;
  }
  // Above, I pass pool as a constructor that will later be used as a object to interact with our database in index.js.

  executeDepartments() {
    return this.pool.query("SELECT * FROM department").catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
  }
  // Above is a function in the object that returns the depatment table.
  executeRoles() {
    return this.pool
      .query(
        "SELECT role.id, role.title, role.salary, department.name as department_name FROM role JOIN department ON role.department_id = department.id"
      )
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above is a function in the object that returns the role table.
  executeemployee() {
    return this.pool
      .query(
        "SELECT e.id, e.first_name, e.last_name, role.salary AS salary, role.title AS role_name, department.name AS department_name, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employee e JOIN role ON e.role_id = role.id JOIN department ON role.department_id = department.id  LEFT JOIN employee m ON e.manager_id = m.id"
      )
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above is a function in the object that returns the employee table.

  allRoles() {
    return this.pool.query("SELECT * FROM role").catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
  }
  // Above, is a function to execute the roles table that i will use later.

  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }

  // Above, is a function that closes the db and exists back to the terminal.
}

class SQLAddDepQuery extends SQLQuery {
  constructor(pool, name) {
    super(pool);
    this.name = name;
  }
  // Above, we inherit pool from its parent SQLQuery
  addDepartment() {
    return this.pool
      .query(`INSERT INTO department (name) VALUES ($1)`, [this.name])
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above, we create the add Department method that queries an insert into the departments table.
  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }
  // Above, is a function that closes the db and exists back to the terminal.
}

class SQLAddRoleQuery extends SQLQuery {
  constructor(pool, title, salary, departmentID) {
    super(pool);
    if (isNaN(salary)) {
      throw new Error("Invalid data type!");
    }
    // Above, we check and see if the salary is a number and if it is not we throw a error.
    this.title = title;
    this.salary = salary;
    this.departmentID = departmentID;
  }

  addRole() {
    return this.pool
      .query(
        `INSERT INTO role (title, salary, department_id) VALUES ($1,$2,$3)`,
        [this.title, this.salary, this.departmentID]
      )
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above, we create the add Role method that queries an insert into the role table.
  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }
}

module.exports = { SQLQuery, SQLAddDepQuery, SQLAddRoleQuery };
