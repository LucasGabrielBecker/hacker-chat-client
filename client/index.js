#!/usr/bin/env node

/*
    chmod +x index.js

    TO RUN THE PROJECT

    hacker-chat \
        --username your-username \
        --room the-room-you-want

*/

import TerminalController from "./src/terminalController.js";
import Events from 'events'
import CliConfig from "./src/cliConfig.js";
import SocketClient from "./src/socket.js";
import EventManager from "./src/eventManager.js";

const [nodepath, filepath, ...commands] = process.argv
const config = CliConfig.parseArguments(commands)
const componentEmitter = new Events()
const socketClient = new SocketClient(config)
await socketClient.initialize()
const eventManager = new EventManager({componentEmitter, socketClient})
const events = eventManager.getEvents()
socketClient.attachEvents(events)
const data = {
    roomId: config.room,    
    userName: config.username
}

eventManager.joinRoomAndWaitForMessages(data)
const controller = new TerminalController()
await controller.initializeTable(componentEmitter)

