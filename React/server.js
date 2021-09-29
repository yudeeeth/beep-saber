const httpServer = require('http').createServer();

const io = require("socket.io")(httpServer, {
    cors: {
        origin: ["http://localhost:3000","http://localhost:5500"],
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let allSockets = [];

io.on("connection", (socket) => {
    allSockets.push(socket);
    console.log("New client connected");
    socket.on("coords",(data)=>{
        allSockets.forEach(s => {
            if(s.id !== socket.id){
                s.emit("coords",data);
            }
        });
    })
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        allSockets = allSockets.filter(s => s.id !== socket.id);
    });
});


io.listen(5000);