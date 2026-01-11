import shlex
from collections import defaultdict


#tables and columns
class Column:
    def __init__(self, name, dtype, primary=False, unique=False):
        self.name = name
        self.dtype = dtype
        self.primary = primary
        self.unique = unique


class Table:
    def __init__(self, name, columns):
        self.name = name
        self.columns = columns
        self.rows = []
        self.indexes = defaultdict(dict)

        for col in columns:
            if col.primary or col.unique:
                self.indexes[col.name] = {}


    #validate data type
    def _validate(self, row, ignore_row=None):
        for col in self.columns:
            val = row[col.name]

            if col.dtype == "INT" and not isinstance(val, int):
                raise ValueError(f"{col.name} must be INT")

            if col.name in self.indexes:
                key = str(val).strip()
                existing = self.indexes[col.name].get(key)
                if existing and existing is not ignore_row:
                    raise ValueError(f"Duplicate value for {col.name}")


    #sql functions
    def insert(self, row):
        self._validate(row)
        row_copy = dict(row)
        self.rows.append(row_copy)

        for col, idx in self.indexes.items():
            idx[str(row_copy[col]).strip()] = row_copy

    def select(self, where=None):
        if not where:
            return self.rows

        col, val = where
        val = str(val).strip()

        if col in self.indexes:
            return [self.indexes[col][val]] if val in self.indexes[col] else []

        return [r for r in self.rows if str(r[col]).strip() == val]

    def update(self, where, updates):
        rows = self.select(where)

        for row in rows:
            new_row = row.copy()
            new_row.update(updates)

            #validations
            self._validate(new_row, ignore_row=row)

            # update indexes
            for col, idx in self.indexes.items():
                old_key = str(row[col]).strip()
                new_key = str(new_row[col]).strip()

                if old_key != new_key:
                    idx.pop(old_key, None)
                    idx[new_key] = row

            row.update(updates)

    def delete(self, where):
        to_delete = self.select(where)
        self.rows = [r for r in self.rows if r not in to_delete]

        for col, idx in self.indexes.items():
            for row in to_delete:
                idx.pop(str(row[col]).strip(), None)


class Database:
    def __init__(self):
        self.tables = {}

    def create_table(self, name, columns):
        if name not in self.tables:
            self.tables[name] = Table(name, columns)



#sql database
class MiniRDBMS:
    def __init__(self):
        self.db = Database()

    def execute(self, sql):
        tokens = shlex.split(sql)
        cmd = tokens[0].upper()

        if cmd == "CREATE":
            return self._create_table(tokens)
        if cmd == "INSERT":
            return self._insert(tokens)
        if cmd == "SELECT":
            return self._select(tokens)
        if cmd == "UPDATE":
            return self._update(tokens)
        if cmd == "DELETE":
            return self._delete(tokens)

        raise ValueError("Unknown SQL command")


    #does table exists???!!!!!
    def _ensure_table_exists(self, table_name, columns, values):
        if table_name in self.db.tables:
            return

        inferred_columns = []
        for name, val in zip(columns, values):
            dtype = "INT" if isinstance(val, int) else "TEXT"
            inferred_columns.append(Column(name, dtype))

        self.db.create_table(table_name, inferred_columns)


    #sql commands
    def _create_table(self, t):
        name = t[2]
        cols = []

        for coldef in " ".join(t[3:]).strip("()").split(","):
            parts = coldef.strip().split()
            cols.append(Column(
                parts[0],
                parts[1],
                "PRIMARY" in parts,
                "UNIQUE" in parts
            ))

        self.db.create_table(name, cols)
        return f"Table {name} created"

    def _insert(self, tokens):
        table_name = tokens[2]

        col_tokens = []
        i = 3
        while not tokens[i].upper().startswith("VALUES"):
            col_tokens.append(tokens[i])
            i += 1

        col_str = " ".join(col_tokens)
        col_str = col_str[col_str.find("(")+1:col_str.rfind(")")]
        columns = [c.strip() for c in col_str.split(",")]

        val_str = " ".join(tokens[i+1:])
        val_str = val_str[val_str.find("(")+1:val_str.rfind(")")]

        values, current, in_string = [], "", False
        for ch in val_str:
            if ch == "'" and not in_string:
                in_string = True
                continue
            elif ch == "'" and in_string:
                in_string = False
                values.append(current)
                current = ""
                continue
            if ch == "," and not in_string:
                if current.strip():
                    values.append(current.strip())
                current = ""
            else:
                current += ch

        if current.strip():
            values.append(current.strip())

        parsed = [int(v) if v.isdigit() else v for v in values]

        self._ensure_table_exists(table_name, columns, parsed)
        table = self.db.tables[table_name]

        table.insert(dict(zip(columns, parsed)))
        return "1 row inserted"


    #select and join
    def _select(self, t):
        if "JOIN" in t:
            return self._join_select(t)

        table_name = t[t.index("FROM")+1]
        table = self.db.tables.get(table_name)

        if not table:
            return []

        if "WHERE" in t:
            i = t.index("WHERE")
            return table.select((t[i+1], t[i+3].strip("'")))

        return table.select()

    def _join_select(self, t):
        left = t[t.index("FROM")+1]
        right = t[t.index("JOIN")+1]

        on_i = t.index("ON")
        lcol = t[on_i+1].split(".")[1]
        rcol = t[on_i+3].split(".")[1]

        lt = self.db.tables[left]
        rt = self.db.tables[right]

        results = []
        for lr in lt.rows:
            for rr in rt.rows:
                if str(lr[lcol]) == str(rr[rcol]):
                    joined = {}
                    for k, v in lr.items():
                        joined[f"{left}.{k}"] = v
                    for k, v in rr.items():
                        joined[f"{right}.{k}"] = v
                    results.append(joined)

        return results

    #update function

    def _update(self, t):
        table_name = t[1]
        table = self.db.tables[table_name]

        set_i = t.index("SET")+1
        where_i = t.index("WHERE")

        updates = {}
        i = set_i

        while i < where_i:
            col = t[i]
            i += 2

            tokens = []
            while i < where_i and not (i+1 < where_i and t[i+1] == "="):
                tokens.append(t[i].rstrip(","))
                i += 1

            raw = " ".join(tokens).strip("'")
            col_def = next(c for c in table.columns if c.name == col)
            updates[col] = int(raw) if col_def.dtype == "INT" else raw

        table.update((t[where_i+1], t[where_i+3].strip("'")), updates)
        return "Updated"

    def _delete(self, t):
        table = self.db.tables[t[2]]
        i = t.index("WHERE")
        table.delete((t[i+1], t[i+3].strip("'")))
        return "Deleted"



#cmd inerface
def repl():
    db = MiniRDBMS()
    print("MiniRDBMS — type 'exit' to quit")

    while True:
        try:
            sql = input("db> ")
            if sql.lower() in ("exit", "quit"):
                break
            print(db.execute(sql))
        except Exception as e:
            print("Error:", e)


if __name__ == "__main__":
    repl()
