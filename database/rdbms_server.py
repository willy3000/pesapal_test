import socket
import json
# from mini_rdbms import MiniRDBMS
from mini_rdbms_sec import MiniRDBMS

db = MiniRDBMS()

HOST = "127.0.0.1"
PORT = 9000

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((HOST, PORT))
server.listen(5)

print("Python RDBMS running on port 9000")

while True:
    conn, _ = server.accept()
    data = conn.recv(4096).decode()

    try:
        request = json.loads(data)
        result = db.execute(request["sql"])
        response = {"status": "ok", "result": result}
    except Exception as e:
        response = {"status": "error", "error": str(e)}

    conn.send(json.dumps(response).encode())
    conn.close()
