import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request, jsonify, url_for, redirect
from flask_socketio import SocketIO, emit, join_room
from cryptography.fernet import Fernet
import qrcode
import io
import os
import base64
import uuid
import socket

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

QR_FOLDER = 'static/qr_codes'
os.makedirs(QR_FOLDER, exist_ok=True)

# In-memory store (use DB in prod)
rooms = {}

def get_local_ip():
    return socket.gethostbyname(socket.gethostname())

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create_room', methods=['POST'])
def create_room():
    try:
        room_id = str(uuid.uuid4())[:8]
        key = Fernet.generate_key().decode()
        rooms[room_id] = key

        # Combine room and key in QR content
        qr_content = f"http://127.0.0.1:5000/chatroom/{room_id}/{key}"
        qr_img = qrcode.make(qr_content)

        # Convert QR to base64 image
        buffered = io.BytesIO()
        qr_img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        chat_link = url_for('chatroom', room_id=room_id, key=key, _external=True)
        return jsonify({'room_id': room_id, 'key': key, 'qr_code': img_base64,'chat_link': chat_link})
    
    except Exception as e:
        print(f"ERROR CREATING ROOM: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/chatroom/<room_id>/<key>')
def chatroom(room_id, key):
    if room_id not in rooms:
        rooms[room_id] = key
        return "Invalid Room ID", 404

    # Optional: validate key matches the room
    if rooms[room_id] != key:
        return "Invalid Key", 403

    return render_template('chatroom.html', room_id=room_id, key=key)

@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['user']
    join_room(room)
    emit('status', {'msg': f'{username} has joined the room.'}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    room = data['room']
    user = data['user']
    msg = data['msg']

    key = rooms.get(room)
    if not key:
        emit('error', {'msg': 'Room key not found.'})
        return

    fernet = Fernet(key.encode())
    encrypted = fernet.encrypt(msg.encode()).decode()

    emit('receive_message', {'user': user, 'msg': encrypted}, room=room)

@app.route('/decrypt', methods=['POST'])
def decrypt():
    data = request.json
    key = data['key']
    encrypted_msg = data['msg']

    try:
        f = Fernet(key.encode())
        decrypted = f.decrypt(encrypted_msg.encode()).decode()
        return jsonify({'decrypted': decrypted})
    except Exception as e:
        return jsonify({'decrypted': '[Decryption Failed]'}), 400

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
    # Use eventlet for better concurrency handling