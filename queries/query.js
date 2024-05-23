



class SQLQuery {
  constructor(pool) {
    this.pool = pool
       
  }
// Above, I pass pool as a constructor that will later be used as a object to interact with our database in index.js.

  executeDepartments() {
    return this.pool.query("SELECT * FROM department").catch(error => {
        console.error("Error executing query:", error);
        throw error;
      });
    }
  // Above is a function in the object that returns the depatment table.
    executeRoles(){
        return this.pool.query("SELECT role.id, role.title, role.salary, department.name as department_name FROM role JOIN department ON role.department_id = department.id").catch(error => {
            console.error("Error executing query:", error);
            throw error;
          });

    }
    // Above is a function in the object that returns the role table.
    executeemployee(){
        return this.pool.query("SELECT e.id, e.first_name, e.last_name, role.title as role_name, m.first_name AS manager_name, m.last_name AS manager_last_name FROM employee e JOIN role ON e.role_id = role.id LEFT JOIN employee m ON e.manager_id = m.id").catch(error => {
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


class SQLAddDepQuery extends SQLQuery {
  constructor(pool,name){
  super(pool)
  this.name = name
  }





  addDepartment(){
    return this.pool.query(`INSERT INTO department (name) VALUES ($1)`, [this.name] ).catch(error => {
        console.error("Error executing query:", error);
        throw error;
      });
  }




  close() {
    this.pool.end();
    console.log("Database connection closed.");
    process.exit();
}


}







module.exports = {SQLQuery, SQLAddDepQuery}