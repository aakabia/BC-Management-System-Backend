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

  allEmployess() {
    return this.pool.query("SELECT * FROM employee").catch((error) => {
      console.error("Error executing query:", error);
      throw error;
    });
  }

  employeesByManager() {
    return this.pool
      .query(
        "SELECT e.first_name, e.last_name, m.first_name AS manager_first_name, m.last_name AS manager_last_name FROM employee e LEFT JOIN employee m ON e.manager_id = m.id "
      )
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }

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

class SQLAddEmployeeQuery extends SQLQuery {
  constructor(pool, firstName, lastName, roleID, managerID) {
    super(pool);

    this.firstName = firstName;
    this.lastName = lastName;
    this.roleID = roleID;
    this.managerID = managerID;
  }

  addEmployee() {
    return this.pool
      .query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1,$2,$3,$4)`,
        [this.firstName, this.lastName, this.roleID, this.managerID]
      )
      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above, we create the add employee method that queries an insert into the employee table.
  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }
}

class UpdateEmployeeRoleQuery extends SQLQuery {
  constructor(pool, employeeID, newRoleID) {
    super(pool);

    this.employeeID = employeeID;
    this.newRoleID = newRoleID;
  }

  upDateEmployeeRole() {
    return this.pool
      .query(`UPDATE employee SET role_id = $1 WHERE id = $2`, [
        this.newRoleID,
        this.employeeID,
      ])

      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above, we create the a update employee method that queries an update to role_id in employee table.
  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }
}

class UpdateEmployeeManagerQuery extends SQLQuery {
  constructor(pool, employeeID, newManagerId) {
    super(pool);

    this.employeeID = employeeID;
    this.newManagerId = newManagerId;
  }

  upDateEmployeeManager() {
    return this.pool
      .query(`UPDATE employee SET manager_id = $1 WHERE id = $2`, [
        this.newManagerId,
        this.employeeID,
      ])

      .catch((error) => {
        console.error("Error executing query:", error);
        throw error;
      });
  }
  // Above, we create the a update employee method that queries an update to role_id in employee table.
  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
  }
}

module.exports = {
  SQLQuery,
  SQLAddDepQuery,
  SQLAddRoleQuery,
  SQLAddEmployeeQuery,
  UpdateEmployeeRoleQuery,
  UpdateEmployeeManagerQuery,
};
