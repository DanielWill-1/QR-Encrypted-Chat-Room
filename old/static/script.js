let socket = io();
let roomID = '';
let encryptionKey = '';

document.getElementById("createRoomBtn").onclick = async () => {
  const maxUsers = document.getElementById("maxUsers").value;
  const res = await fetch("/create_room", { 
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ max_users: maxUsers })
  });
  const data = await res.json();

  if (data.error) {
    alert('Error creating room: ' + data.error);
    return;
  }

  roomID = data.room_id;
  encryptionKey = data.key;
  document.getElementById("roomID").textContent = roomID;
  document.getElementById("chatSection").style.display = "block";

  // Show QR code
  const img = new Image();
  img.src = "data:image/png;base64," + data.qr_code;
  document.getElementById("qrContainer").innerHTML = '';
  document.getElementById("qrContainer").appendChild(img);

  const roomUrl = `${window.location.origin}/chatroom/${roomID}/${encryptionKey}`;
  const linkHTML = `<a href="${roomUrl}" target="_blank">${roomUrl}</a>`;
  const roomLinkDiv = document.getElementById("roomLink");
  roomLinkDiv.innerHTML = `<p>Shareable link: ${linkHTML}</p>`;
  roomLinkDiv.style.display = "block";

  // Emit join event
  socket.emit('join', { room: roomID, user: "Host" });
};

function sendMessage() {
  const msg = document.getElementById("messageInput")?.value || document.getElementById("message")?.value;
  const user = document.getElementById("username").value || "Anonymous";
  if (msg && roomID) {
    socket.emit('send_message', { room: roomID, user: user, msg: msg });
    const messageInput = document.getElementById("messageInput") || document.getElementById("message");
    messageInput.value = '';
  }
}

function leaveRoom() {
  const username = document.getElementById("username").value || "Anonymous";
  if (roomID) {
    socket.emit('leave', { room: roomID, user: username });
    // Reset UI based on page
    if (window.location.pathname.includes('/chatroom')) {
      // Redirect to homepage for chatroom.html
      window.location.href = '/';
    } else {
      // Reset index.html UI
      document.getElementById("chatSection").style.display = "none";
      document.getElementById("qrContainer").innerHTML = '';
      document.getElementById("roomLink").style.display = "none";
      document.getElementById("messages").innerHTML = '';
      document.getElementById("username").value = '';
    }
    roomID = '';
    encryptionKey = '';
  }
}

socket.on('receive_message', async (data) => {
  const res = await fetch('/decrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg: data.msg, key: encryptionKey })
  });

  const decrypted = await res.json();
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  li.innerHTML = `🔐 <b>${data.user}:</b> ${decrypted.decrypted} <br><span class="encrypted">(encrypted: ${data.msg})</span>`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('status', (data) => {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  li.textContent = `🟢 ${data.msg}`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('error', (data) => {
  alert(data.msg);
});

// Initialize chat if on chatroom page
if (window.location.pathname.includes('/chatroom')) {
  const pathParts = window.location.pathname.split('/');
  roomID = pathParts[2];
  encryptionKey = pathParts[3];
  document.getElementById("roomID").textContent = roomID;
  document.getElementById("username").addEventListener('change', () => {
    const username = document.getElementById("username").value || "Anonymous";
    socket.emit('join', { room: roomID, user: username });
  });
}