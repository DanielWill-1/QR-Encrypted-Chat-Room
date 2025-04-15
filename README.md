# 🔐 QR-Encrypted Chatroom

A real-time, secure chatroom where users can connect via QR codes. Messages are end-to-end encrypted using Fernet (AES).

## 🚀 Demo
![Demo pic](image.png)

---
## 🧪 Tech Stack

| Layer        | Technology                             |
|--------------|----------------------------------------|
| Backend      | [Flask](https://flask.palletsprojects.com/), [Socket.IO](https://socket.io/) |
| Realtime     | [Flask-SocketIO](https://flask-socketio.readthedocs.io/en/latest/) |
| Encryption   | [cryptography.Fernet](https://cryptography.io/en/latest/fernet/) |
| QR Code      | [qrcode](https://pypi.org/project/qrcode/) |
| Frontend     | HTML, CSS, JavaScript                  |
| Concurrency  | [eventlet](https://pypi.org/project/eventlet/) |

---
## 🛠️ Setup

```bash
git clone https://github.com/DanielWill-1/QR-Encrypted-Chat-Room
cd qr-chatroom
pip install -r requirements.txt
python app.py
```