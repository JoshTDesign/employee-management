//Dependencies
const fs = require('fs');
const inquirer = require('inquirer');
const mysql = require('mysql');
const connection = require('connection');

const viewAll = () => {
    const query = connection.query(
    'SELECT first_name, last_name FROM employee',
    (err, res) => {
      if (err) throw err;
      connection.end();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
};

const testFunc = () => {
  console.log('running testFunc()');
}

const test = "this is a test";
// console.log(test);

viewAll();


// export
// module.exports = util;
module.exports = {
  viewAll, 
  testFunc,
  test,
};