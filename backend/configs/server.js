const { Server } = require("socket.io");
let IO;
const onlineUsers = [];

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      socket.user = socket.handshake.query.callerId;
      onlineUsers.push(socket.user);
      next();
    }
  });

  IO.on("connection", (socket) => {
    // console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("call", (data) => {
      const { calleeId, rtcMessage } = data;
      socket.to(calleeId).emit("newCall", {callerId: socket.user,rtcMessage: rtcMessage});
    });

    socket.on("answerCall", (data) => {
      const { callerId, rtcMessage } = data;
      socket.to(callerId).emit("callAnswered", {callee: socket.user,rtcMessage: rtcMessage});
    });

    socket.on("declineCall", (data) => {
      const { callerId } = data;
      socket.to(callerId).emit("callDeclined", { callee: socket.user });
      socket.emit("callDeclined", { caller: socket.user })
    });

    socket.on("ICEcandidate", (data) => {
      const {calleeId,rtcMessage} = data;
      socket.to(calleeId).emit("ICEcandidate", {sender: socket.user,rtcMessage: rtcMessage});
    });

    socket.on("getRandomOnlineUser", () => {
      const filteredUsers = onlineUsers.filter(el=>el!=socket.user);
      const randomIndex = Math.floor(Math.random() * filteredUsers.length);
      const randomUser = filteredUsers[randomIndex];
      socket.emit("randomOnlineUser", randomUser);
    });

    socket.on("disconnect", () => {
      const index = onlineUsers.indexOf(socket.user);
      if (index !== -1)onlineUsers.splice(index, 1);
    });
  });
};

module.exports.getIO = () => {
  if (!IO) throw Error("IO not initilized.");
  else return IO;
};