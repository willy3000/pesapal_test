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

    def _validate(self, row):
        for col in self.columns:
            val = row[col.name]

            if col.dtype == "INT" and not isinstance(val, int):
                raise ValueError(f"{col.name} must be INT")

            if col.name in self.indexes:
                key = str(val).strip()
                if key in self.indexes[col.name]:
                    raise ValueError(f"Duplicate value for {col.name}")

    def insert(self, row):
        self._validate(row)
        row_copy = dict(row)
        self.rows.append(row_copy)

        # Update indexes
        for col, idx in self.indexes.items():
            key = str(row_copy[col]).strip()
            idx[key] = row_copy

    def select(self, where=None):
        if not where:
            return self.rows

        col, val = where
        val = str(val).strip()

        if col in self.indexes:
            return [self.indexes[col][val]] if val in self.indexes[col] else []

        return [r for r in self.rows if str(r[col]).strip() == val]

    def update(self, where, updates):
        for row in self.select(where):
            for k, v in updates.items():
                row[k] = v

    def delete(self, where):
        to_delete = self.select(where)
        self.rows = [r for r in self.rows if r not in to_delete]

        for col, idx in self.indexes.items():
            for row in to_delete:
                key = str(row[col]).strip()
                idx.pop(key, None)


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


    #check if table exists
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
            cols.append(
                Column(
                    parts[0],
                    parts[1],
                    "PRIMARY" in parts,
                    "UNIQUE" in parts
                )
            )

        self.db.create_table(name, cols)
        return f"Table {name} created"

    def _insert(self, tokens):
        table_name = tokens[2]

        #columns
        col_tokens = []
        i = 3
        while not tokens[i].upper().startswith("VALUES"):
            col_tokens.append(tokens[i])
            i += 1

        col_str = " ".join(col_tokens).strip()
        col_str = col_str[col_str.find("(") + 1: col_str.rfind(")")]
        columns = [c.strip() for c in col_str.split(",")]

        #column values
        val_tokens = tokens[i + 1:]
        val_str = " ".join(val_tokens).strip()
        val_str = val_str[val_str.find("(") + 1: val_str.rfind(")")]

        values = []
        current = ""
        in_string = False

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

        parsed_values = []
        for v in values:
            if v.isdigit():
                parsed_values.append(int(v))
            else:
                parsed_values.append(v)

        #does table exists??!!
        self._ensure_table_exists(table_name, columns, parsed_values)

        table = self.db.tables[table_name]

        # create the row
        row = {}
        for col, val in zip(columns, parsed_values):
            row[col] = val

        table.insert(row)
        return "1 row inserted"

    def _select(self, t):
        table_name = t[t.index("FROM") + 1]

        if table_name not in self.db.tables:
            return []

        table = self.db.tables[table_name]

        if "WHERE" in t:
            i = t.index("WHERE")
            val = t[i+3].strip("'")
            return table.select((t[i+1], val))

        return table.select()

    def _update(self, t):
        table_name = t[1]

        if table_name not in self.db.tables:
            return "Table does not exist"

        table = self.db.tables[table_name]

        set_i = t.index("SET") + 1
        where_i = t.index("WHERE")

        updates = {}
        i = set_i

        while i < where_i:
            column = t[i]  # column name
            i += 2  # skip column and '='

            value_tokens = []

            while i < where_i:
                # STOP if next token starts a new assignment: <col> =
                if i + 1 < where_i and t[i + 1] == '=':
                    break

                token = t[i].rstrip(',')  # remove trailing commas
                value_tokens.append(token)
                i += 1

            raw_value = " ".join(value_tokens).strip("'")

            column_def = next(c for c in table.columns if c.name == column)
            value = int(raw_value) if column_def.dtype == "INT" else raw_value

            updates[column] = value

        # WHERE...
        where_col = t[where_i + 1]
        where_val = t[where_i + 3].strip("'")

        table.update((where_col, where_val), updates)
        return "Updated"

    def _delete(self, t):
        table_name = t[2]

        if table_name not in self.db.tables:
            return "Table does not exist"

        table = self.db.tables[table_name]

        where_i = t.index("WHERE")
        val = t[where_i+3].strip("'")
        table.delete((t[where_i+1], val))

        return "Deleted"
