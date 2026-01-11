from mini_rdbms import MiniRDBMS

db = MiniRDBMS()

print(db.execute("CREATE TABLE users (id INT PRIMARY, name TEXT UNIQUE)"))

print(db.execute("INSERT INTO users VALUES (1, 'Alice')"))
print(db.execute("INSERT INTO users VALUES (2, 'Bob')"))

print("Select all:")
print(db.execute("SELECT * FROM users"))

print("Select id=1:")
print(db.execute("SELECT * FROM users WHERE id = 1"))

print("Update id=2:")
print(db.execute("UPDATE users SET name = 'Bobby' WHERE id = 2"))
print(db.execute("SELECT * FROM users WHERE id = 2"))

print("Delete id=1:")
print(db.execute("DELETE FROM users WHERE id = 1"))
print(db.execute("SELECT * FROM users"))