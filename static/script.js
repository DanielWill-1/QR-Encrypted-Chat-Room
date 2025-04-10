let socket = io();
let roomID = '';
let encryptionKey = '';

document.getElementById("createRoomBtn").onclick = async () => {
  const res = await fetch("/create_room", { method: "POST" });
  const data = await res.json();

  roomID = data.room_id;
  encryptionKey = data.key; // updated to use correct field
  document.getElementById("roomID").textContent = roomID;
  document.getElementById("chatSection").style.display = "block";

  // Show QR code
  const img = new Image();
  img.src = "data:image/png;base64," + data.qr_code;
  document.getElementById("qrContainer").innerHTML = '';
  document.getElementById("qrContainer").appendChild(img);

  // Show shareable chatroom link
  const linkDiv = document.getElementById("roomLink");
  linkDiv.innerHTML = `<p>Shareable link: <a href="${data.chat_link}" target="_blank">${data.chat_link}</a></p>`;
  linkDiv.style.display = "block";

  // Emit join event
  socket.emit('join', { room: roomID, user: "Host" });
};

function sendMessage() {
  const msg = document.getElementById("messageInput").value;
  const user = document.getElementById("username").value || "Anonymous";
  socket.emit('send_message', { room: roomID, user: user, msg: msg });
}

socket.on('receive_message', async (data) => {
  const res = await fetch('/decrypt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msg: data.msg, key: encryptionKey })
  });

  const decrypted = await res.json();
  const li = document.createElement("li");
  li.textContent = `${data.user}: ${decrypted.decrypted}`;
  document.getElementById("messages").appendChild(li);
});

socket.on('status', (data) => {
  const li = document.createElement("li");
  li.textContent = data.msg;
  document.getElementById("messages").appendChild(li);
});
