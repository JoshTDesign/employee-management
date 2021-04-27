USE employeeDB;

-- SELECT first_name, last_name FROM employee;
-- SELECT first_name, last_name, role.id, title FROM employee LEFT JOIN role ON (employee.role_id = role.id) ORDER BY role.id DESC;
SELECT first_name, last_name, role_id, role.id, department_id, department.id, department.name 
FROM employee JOIN role ON (role_id = role.id) JOIN department ON (department_id = department.id) 
ORDER BY department_id;

