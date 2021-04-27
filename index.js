//Dependencies
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql');
const uniqid = require('uniqid');

// const util = require('./util.js');
//Global variables
const currentEmployee = {};


// Connect to database
const connection = mysql.createConnection({
    host: 'localhost',
// Port
    port: 3306,
// Username
    user: 'root',
    password: 'password',
    database: 'employeedb',
});

// Initiate program
const init = () => {
    inquirer 
        .prompt ([
            {
                name: "choice",
                choices: ["View all employees", "View all employees by department", "View all employees by manager", "Add employee", "Add role", "Remove employee", "Update employee role", "Update employee manager", "View all roles", "Exit"],
                message: "What would you like to do?",
                type: "list"
            }
        ])
        .then (({choice}) => {
            switch (choice) {
                case "View all employees":
                    viewAll();
                    break;
                case "View all employees by department":
                    viewAllByDept();
                    break;
                case "View all employees by manager":
                    viewAllByManager(); //revisit this
                    break;
                case "Add employee":
                    addEmployee();
                    break;
                case "Add role":
                    addRole();
                    break;
                case "Remove employee":
                    removeEmployee();
                    break;
                case "Update employee role":
                    updateRole();
                    break;
                case "Update employee manager":
                    updateManager();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "Quit":
                    console.log("Goodbye")
                    connection.end();
                    break;
                default:
                    console.log("see ya!")
                    connection.end();
                    break;
            }

        })
}


const updateRole = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
    connection.query('SELECT * FROM role', (employeeErr, roleResults) => {
        if (employeeErr) throw err;
        inquirer
        .prompt([
            {
                name: 'employee',
                type: 'rawlist',
                choices() {
                    const choiceArray = results.map(emp =>({name:`${emp.first_name} ${emp.last_name}`, value:emp.id}));
                    return choiceArray;
                },
                message: 'Choose an employee to update'
            }
        ])
        .then((answer) => {
            const thisId = answer.employee;
            // console.log(thisId);
            inquirer
                .prompt([
                    {
                        name: 'role',
                        type: 'rawlist',
                        choices() {
                            const choiceArray = roleResults.map(emp =>({name:`${emp.title}`, value:emp.id}));
                            return choiceArray;
                        },
                        message: 'Choose a job title'
                    },
                ])
                .then((answer) => {
                    const newRole = answer.role;
                    connection.query(
                       `UPDATE employee SET ? WHERE ?`, 
                        [
                           {
                               'role_id': newRole, 
                           },
                           {
                               'id': thisId, 
                           },
                        ], (err, results) => {
                        if (err) throw err;
                    })
                    console.log(`

------------------------------------------------
*  This employee\'s role has been updated.     *
------------------------------------------------

`);
                    init();
                });
        })
    })
    })
};


const updateManager = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
    connection.query('SELECT * FROM employee WHERE role_id=300', (managerErr, managerResults) => {
        if (managerErr) throw err;
        inquirer
        .prompt([
            {
                name: 'employee',
                type: 'rawlist',
                choices() {
                    const choiceArray = results.map(emp =>({name:`${emp.first_name} ${emp.last_name}`, value:emp.id}));
                    return choiceArray;
                },
                message: 'Choose an employee to update'
            }
        ])
        .then((answer) => {
            const thisId = answer.employee;
            inquirer
                .prompt([
                    {
                        name: 'manager',
                        type: 'rawlist',
                        choices() {
                            const choiceArray = managerResults.map(emp =>({name:`${emp.first_name} ${emp.last_name}`, value:emp.id}));
                            return choiceArray;
                        },
                        message: 'Choose a manager'
                    },
                ])
                .then((answer) => {
                    const newManager = answer.manager;
                    connection.query(
                       `UPDATE employee SET ? WHERE ?`, 
                        [
                           {
                               'manager_id': newManager, 
                           },
                           {
                               'id': thisId, 
                           },
                        ], (err, results) => {
                        if (err) throw err;
                    })
                    console.log(`
------------------------------------------------
*  This employee\'s manager has been updated.  *
------------------------------------------------
`);
                    init();
                });
        })
    })
    })
};

const removeEmployee = () => {
    connection.query('SELECT * FROM employee', (err, results) => {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: 'employee',
                    type: 'rawlist',
                    choices() {
                        const choiceArray = results.map(emp =>({name:`${emp.first_name} ${emp.last_name}`, value:emp.id}));
                        return choiceArray;
                    },
                    message: 'Choose an employee to remove'
                }
            ])
            .then((answer) => {
                console.log(answer.employee);
                connection.query(`
                    DELETE FROM employee 
                    WHERE id = ?
                    `, [answer.employee], (err, results) => {
                    if (err) throw err;
            })
            console.log(`

------------------------------------------------
*  This employee has been removed.             *
------------------------------------------------
            
                                          `);            
            init();
    })
})};


const addEmployee = () => {
    connection.query('SELECT * FROM role', (roleErr, roleResults) => {
        if (roleErr) throw err;
    connection.query('SELECT * FROM employee WHERE role_id=300', (employeeErr, employeeResults) => {
        if (employeeErr) throw err;

        inquirer
            .prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: 'Enter the new employees first name'
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: 'Enter the new employees last name'
                },
                {
                    name: 'role',
                    type: 'rawlist',
                    choices() {
                        const choiceArray = [];
                        roleResults.forEach(({title}) => {
                            choiceArray.push(title);
                        });
                        return choiceArray;
                    },
                    message: 'Choose a job title'
                },
                {
                    name: 'manager',
                    type: 'rawlist',
                    choices() {
                        const choiceArray = employeeResults.map(emp =>({name: `${emp.first_name} ${emp.last_name}`, value:emp.id}));
                        return choiceArray;
                    },
                    message: 'Choose a manager'
                }
            ])
            .then((answer) => {
                let chosenItem;
                //assign variables based on answers
                const thisId = Math.floor(Math.random() * 100000);
                const thisFirst = answer.firstName;
                const thisLast = answer.lastName;
                // match 'role' answer to role in order to assign correct role_id
                chosenItem = answer.role;

                roleResults.forEach((item) => {
                    if (item.title === chosenItem) {
                        const chosenRoleId = item.id;
                        connection.query(
                            'INSERT INTO employee SET ?',
                            {
                              id: thisId,
                              first_name: thisFirst,
                              last_name: thisLast,
                              role_id: chosenRoleId,
                              manager_id: answer.manager
                            },
                            (err) => {
                              if (err) throw err;
                              console.log(`

------------------------------------------------
*  A new employee has been created!            *
------------------------------------------------

                              `);
                              init();
                            } 
                        )
                    }

                });
            })
    })
    })
};

const addRole = () => {
    connection.query('SELECT * FROM role', (err, results) => {
        if (err) throw err;
    connection.query('SELECT * FROM department', (departmentErr, departmentResults) => {
        if (departmentErr) throw err;

        inquirer
            .prompt([
                {
                    name: 'roleName',
                    type: 'input',
                    message: 'Enter the name of this role'
                },
                {
                    name: 'roleSalary',
                    type: 'input',
                    message: 'Enter the salary for this role'
                },
                {
                    name: 'roleDepartment',
                    type: 'rawlist',
                    choices() {
                        const choiceArray = departmentResults.map(emp =>({name: `${emp.name}`, value:emp.id}));
                        return choiceArray;
                    },
                    message: 'Choose a department'
                }
            ])
            .then((answer) => {
                let chosenItem;
                //assign variables based on answers
                const thisId = Math.floor(Math.random() * 1000);
                const thisName = answer.roleName;
                const thisSalary = answer.roleSalary;
                // match 'role' answer to role in order to assign correct role_id
                chosenItem = answer.roleDepartment;
                connection.query(
                    `INSERT INTO role SET ?`, 
                    {
                        id: thisId,
                        title: thisName, 
                        salary: thisSalary, 
                        department_id: answer.roleDepartment
                    },
                    (err) => {
                        if (err) throw err;
                
                    console.log(`

------------------------------------------------
*  A new role has been created!                *
------------------------------------------------

                              `);
                              init();
                            } 
                        )
                    

                });
            })
        })
};

const viewAll = () => {
    connection.query(`
    SELECT first_name, last_name, role.title 
    FROM employee 
    JOIN role 
    ON (employee.role_id = role.id)
    ORDER BY role.title
    `, (err, results) => {
        if (err) throw err;
        console.log(`

Employee \t\tRole
---------------------------------------`);
        results.map(emp => {
            console.log(emp.first_name + " " + emp.last_name + "\t\t" + emp.title);
        });
        console.log(`\n\n`);
        init();
    })
};

const viewAllByDept = () => {
    connection.query(`
        SELECT first_name, last_name, role_id, role.id, department_id, department.id, department.name 
        FROM employee JOIN role ON (role_id = role.id) JOIN department ON (department_id = department.id) 
        ORDER BY department_id
        `, (err, results) => {
        if (err) throw err;
        console.log(`

Department \t\tEmployee
---------------------------------------`);
        results.map(emp => {
            console.log(emp.name + "  " + "\t\t" + emp.first_name + " " + emp.last_name);
        });
        console.log(`\n\n`);        
        init();
    })
};

const viewAllByManager = () => {
    connection.query(`
        SELECT id, first_name, last_name, role_id, manager_id
        FROM employee 
        ORDER BY manager_id
        `, (err, results) => {
        if (err) throw err;
        console.log(`

Employee \t\tManager ID
---------------------------------------`);
        results.map(emp => {
            console.log(emp.first_name + " " + emp.last_name + " \t\t" + emp.manager_id);
        });
        console.log(`\n\n`);            
        init();
    })
};

const viewRoles = () => {
    connection.query(`
        SELECT *
        FROM role   
        GROUP BY title
        `, (err, results) => {
        if (err) throw err;
        console.log(`

Role
---------------------------------------`);
        results.map(role => {
            console.log(role.title);
        });
        console.log(`\n\n`);
        

        // console.table(results);
        init();
    })
};


connection.connect((err) => {
    if (err) throw err;
    console.log(`

-----------------------------------------------------------------
*                                                               *
*                         Welcome to the                        *
*                   EMPLOYEE MANAGEMENT SYSTEM                  *
*                                                               *
-----------------------------------------------------------------
                
               `);   

    init();
})






