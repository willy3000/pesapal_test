from mini_rdbms_sec import MiniRDBMS

db = MiniRDBMS()

# Create employees table
print(db.execute("""
CREATE TABLE employees (
    id INT PRIMARY,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    department TEXT,
    status TEXT
)
"""))

# Create departments table
print(db.execute("""
CREATE TABLE departments (
    id INT PRIMARY,
    department_name TEXT UNIQUE,
    manager TEXT
)
"""))

# Insert employee records
print(db.execute("""
INSERT INTO employees (id, name, email, role, department, status) VALUES (
    1,
    'Jillo',
    'jillo@gmail.com',
    'accounts manager',
    'Accounting',
    'active'
)
"""))

print(db.execute("""
INSERT INTO employees (id, name, email, role, department, status) VALUES (
    2,
    'Alice',
    'alice@gmail.com',
    'software engineer',
    'Engineering',
    'active'
)
"""))

# Insert department records
print(db.execute("""
INSERT INTO departments (id, department_name, manager) VALUES (
    1,
    'Accounting',
    'Jillo'
)
"""))

print(db.execute("""
INSERT INTO departments (id, department_name, manager) VALUES (
    2,
    'Engineering',
    'Bob'
)
"""))

# Select all employees
print("Select all employees:")
print(db.execute("SELECT * FROM employees"))

# Select a specific employee
print("Select employee with id = 1:")
print(db.execute("SELECT * FROM employees WHERE id = 1"))

# Update employee status
print("Update employee id = 1:")
print(db.execute("""
UPDATE employees
SET status = 'inactive'
WHERE id = 1
"""))

print("Verify update:")
print(db.execute("SELECT * FROM employees WHERE id = 1"))

# Delete an employee
print("Delete employee id = 2:")
print(db.execute("DELETE FROM employees WHERE id = 2"))

print("Final employees table:")
print(db.execute("SELECT * FROM employees"))

# Test JOIN functionality
print("Performing JOIN between employees and departments:")
print(db.execute("""
SELECT * FROM employees
JOIN departments ON employees.department = departments.department_name
"""))
