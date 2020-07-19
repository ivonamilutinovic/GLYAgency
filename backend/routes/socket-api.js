var socketio = require('socket.io')
let Question = require("../models/question");

module.exports = {

    startSocketServer: function (app) {
        io = socketio.listen(app);

        io.on('connection', function (socket) {
            //if(!isValidDate(new Date() || this.agent == undefined)
            //io.to(socket.id).emit('access', false)
            if (this.agent != undefined) {
                io.to(this.agent).emit('initChat', socket.id);
                io.to(socket.id).emit('access', true)
            }
            else {
                io.to(socket.id).emit('access', false)
            }
            //let token = socket.handshake.query.token;

            socket.on('disconnect', () => {
                if (this.agent == socket.id) {
                    this.agent = undefined
                    socket.broadcast.emit('chatToForm');
                }
                else {
                    io.to(this.agent).emit('endChat', socket.id);
                }
            });

            socket.on("message", (msg) => {
                io.to(this.agent).emit("userToAgent", msg, socket.id)
            })

            socket.on("agent", () => {
                if (this.agent != undefined) {
                    io.to(socket.id).emit('agentChatFull')
                }
                else {
                    this.agent = socket.id
                }
            })

            socket.on("mailForm", (mailForm) => {
                const question = new Question(mailForm);
                question
                    .save()
                    .then((document) => {
                        console.log(`Uspesno sacuvano novo pitanje
                            email: ${document.email}
                            pitanje: ${document.question}`);
                    })
                    .catch((error) => {
                        const responseObject = errorHandler(error)
                        console.log(`Problem pri cuvanju pitanja:
                                    ${responseObject.message}`);
                    }
                    );
                socket.disconnect()
            })

            socket.on("agentToUser", (msg, socketId) => {
                io.to(socketId).emit("message", msg)
            })

            socket.on('typing', (socketId) => {
                io.to(socketId).emit("typing");
            });

            io.on('error', function () {
                console.log("io error");
            });
        });
        io.on('error', function () {
            console.log("io error");
        });
    }
};

function isValidDate(date) {
    const upperBound = 15; //16:00 15:59
    const lowerBound = 8
    const hours = "0" + date.getHours();
    return lowerBound <= hours && hours <= upperBound;
}

function errorHandler(error) {
    let responseError = ""
    let status;
    if (error.name == 'ValidationError') {
        status = 422;
        for (let errName in error.errors) {
            if (error.errors[errName].name == 'ValidatorError')
                responseError += error.errors[errName].message
        }
        if (responseError == "") {
            responseError = "Neispravno uneti podaci. "
        }
    }
    else {
        responseError = "Problem na serveru. ";
        status = 500
    }
    const responseObject = {
        success: false,
        status: status,
        message: responseError
    }
    return responseObject
}
