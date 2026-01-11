# 🚀 Full-Stack Mini RDBMS Project

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python" />
  <img src="https://img.shields.io/badge/Node.js-22.13.1-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express" />
  <img src="https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js" />
  <img src="https://img.shields.io/badge/Status-Complete-success" />
</p>

---

## 📌 Project Overview

This project is a **full-stack system** built to demonstrate a complete data lifecycle using a **custom-built relational database engine**. It showcases how a database can be designed from scratch and integrated with a modern backend and frontend stack.

### 🔧 What This Project Demonstrates

* Custom SQL-like **Relational Database Management System (RDBMS)**
* CRUD operations (Create, Read, Update, Delete)
* Primary keys, unique constraints, and indexing
* JOIN operations
* RESTful API communication
* Full frontend integration

---

## 🧱 Architecture Overview

```
Frontend (Next.js)  →  Backend (Express.js)  →  Mini RDBMS (Python)
      :3000                     :5000                 :9000
```

Each layer runs independently and communicates over HTTP.

---

## 🛠️ Technology Stack

### Languages & Runtimes

* 🐍 **Python 3.11.0**
* 🟢 **Node.js v22.13.1**

### Frameworks & Tools

* 🧠 Custom Mini RDBMS (Python)
* 🚏 Express.js (Backend API)
* ⚛️ Next.js (Frontend)
* 📦 npm & yarn (Package Managers)

---

## 🌐 Services & Ports

| Service           | Port | URL                                            |
| ----------------- | ---- | ---------------------------------------------- |
| Mini RDBMS Server | 9000 | [http://127.0.0.1:9000](http://127.0.0.1:9000) |
| Backend API       | 5000 | [http://localhost:5000](http://localhost:5000) |
| Frontend App      | 3000 | [http://localhost:3000](http://localhost:3000) |

⚠️ **All services must be running simultaneously**

---

## ✅ Prerequisites

Ensure the following are installed:

```bash
python --version   # 3.11.0
node --version     # v22.13.1
npm --version
yarn --version
```

---

## ⬇️ Clone the Repository

```bash
git clone <GITHUB_REPOSITORY_URL>
cd <PROJECT_ROOT_DIRECTORY>
```

---

## 🧠 Running the Mini RDBMS Server

This must be started **first**.
pip install dependancies in **/database/requirements.txt**

```bash
cd database
python rdbms_server.py
```

✔ Runs on `127.0.0.1:9000`

---

## 🔁 Testing the Database Directly (REPL & Function Tests)

While the frontend demonstrates CRUD operations visually, the database itself can be tested independently.

### ▶️ Interactive REPL

```bash
cd database
python mini_rdbms_sec.py
```

This allows direct interaction with the SQL-like interface.

### 🧪 Functional & JOIN Tests

```bash
cd database
python rdbms_func_check_sec.py
```

This script validates:

* CRUD correctness
* Constraints
* JOIN functionality

---

## 🚏 Running the Backend (Express API)

```bash
cd backend
npm install
npm run dev
```

✔ Runs on `http://localhost:5000`

---

## 🖥️ Running the Frontend (Next.js)

```bash
cd frontend
yarn
yarn dev
```

✔ Access at `http://localhost:3000`

---

## 🧪 What the Frontend Demonstrates

* Creating records
* Reading data
* Updating records
* Deleting records

All operations flow:

```
UI → Backend API → Mini RDBMS(Data is persistent as long as the database is running)
```

---

## ▶️ Recommended Execution Order

1. `python rdbms_server.py`
2. `npm run dev` (backend)
3. `yarn dev` (frontend)

---

## 🛠️ Troubleshooting

### ❌ Port Already in Use

Ensure ports **3000, 5000, 9000** are free.

### ❌ Backend Cannot Reach Database

* Confirm RDBMS server is running
* Check connection target is `127.0.0.1:9000`

---

## 🎯 Project Goals & Evaluation Focus

This project highlights:

* Systems design thinking
* SQL parsing and execution
* Indexing and constraints
* Join logic implementation
* Clean separation of concerns
* Full-stack integration

---

## 🏁 Conclusion

This repository represents a **complete end-to-end system**, from database internals to user interface. Assessors can evaluate the project via:

* The web UI
* Direct REPL interaction
* Automated database tests


---

### Credits

**ChatGPT** : Helped with rdbms logic and debugging.
            : Helped to compile documentation.
**create.xyz**: Helped to generate tailwind styles for frontend UI allowing me to focus on logic cutting the frontend development time by a significant amount.

---

---

### 👤 Author

**Willy Wario**

---