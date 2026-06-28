import eventlet
eventlet.monkey_patch()

from flask import Flask, render_template, request, jsonify, url_for, redirect
from flask_socketio import SocketIO, emit, join_room, leave_room
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
        max_users = int(request.json.get('max_users', 2))  # Default to 2 if not provided
        rooms[room_id] = {'key': key, 'max_users': max_users, 'connected_users': []}

        # Combine room and key in QR content
        qr_content = f"http://127.0.0.1:5000/chatroom/{room_id}/{key}"
        qr_img = qrcode.make(qr_content)

        # Convert QR to base64 image
        buffered = io.BytesIO()
        qr_img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        chat_link = url_for('chatroom', room_id=room_id, key=key, _external=True)
        return jsonify({'room_id': room_id, 'key': key, 'qr_code': img_base64, 'chat_link': chat_link, 'max_users': max_users})
    
    except Exception as e:
        print(f"ERROR CREATING ROOM: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/chatroom/<room_id>/<key>')
def chatroom(room_id, key):
    if room_id not in rooms:
        return "Invalid Room ID", 404

    # Validate key matches the room
    if rooms[room_id]['key'] != key:
        return "Invalid Key", 403

    return render_template('chatroom.html', room_id=room_id, key=key)

@socketio.on('join')
def on_join(data):
    room = data['room']
    username = data['user']
    sid = request.sid  # Unique session ID for the client

    if room not in rooms:
        emit('error', {'msg': 'Room does not exist.'})
        return

    # Check if user is already in the room
    if sid in rooms[room]['connected_users']:
        emit('error', {'msg': 'You are already in the room.'})
        return

    # Check user limit
    if len(rooms[room]['connected_users']) >= rooms[room]['max_users']:
        emit('error', {'msg': 'Room is full.'})
        return

    rooms[room]['connected_users'].append(sid)
    join_room(room)
    emit('status', {'msg': f'{username} has joined the room.'}, room=room)

@socketio.on('leave')
def on_leave(data):
    room = data['room']
    username = data['user']
    sid = request.sid

    if room in rooms and sid in rooms[room]['connected_users']:
        rooms[room]['connected_users'].remove(sid)
        leave_room(room)
        emit('status', {'msg': f'{username} has left the room.'}, room=room)
        # Delete room if empty
        if not rooms[room]['connected_users']:
            del rooms[room]

@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    for room_id, room_data in rooms.items():
        if sid in room_data['connected_users']:
            room_data['connected_users'].remove(sid)
            emit('status', {'msg': 'A user has disconnected.'}, room=room_id)
            # Delete room if empty
            if not room_data['connected_users']:
                del rooms[room_id]
            break

@socketio.on('send_message')
def handle_send_message(data):
    room = data['room']
    user = data['user']
    msg = data['msg']

    key = rooms.get(room, {}).get('key')
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