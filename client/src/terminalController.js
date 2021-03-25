import ComponentsBuilder from "./components.js"
import { constants } from "./constants.js"


export default class TerminalController{
    #usersColors = new Map()
    constructor(){

    }

    #pickCollor(){
        return `#${((1 << 24) * Math.random() | 0 ).toString(16)}-fg`
    }

    #getUserColor(userName){
        if(this.#usersColors.has(userName)) return this.#usersColors.get(userName)

        const color = this.#pickCollor()
        this.#usersColors.set(userName, color)

        return color
    }

    #onInputReceived(eventEmmiter){
        return function(){
            const message = this.getValue()
            eventEmmiter.emit(constants.events.app.MESSAGE_SENT, message)
            this.clearValue()
        }
    }

    #onMessageReceived({screen, chat}){
        return msg => {
            const {userName, message} = msg
            const color = this.#getUserColor(userName)

            chat.addItem(`{${color}}{bold}${userName}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChanged({screen, activityLog}){
        return msg => {
            const [userName] = msg.split(/\s/)
            const color = this.#getUserColor(userName)
            activityLog.addItem(`{${color}}{bold}${msg.toString()}{/}`)
            screen.render()
        }

    }

    #onStatusChanged({screen, status}){
        // ['erickwendel', 'beckinho']
        return users => {
            //get first element from list
            const {content} = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const color = this.#getUserColor(userName)
                status.addItem(`{${color}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmmiter, components){
        eventEmmiter.on(constants.events.app.MESSAGE_RECEIVED,             this.#onMessageReceived(components) )
        eventEmmiter.on(constants.events.app.ACTIVITYLOG_UPDATED,   this.#onLogChanged(components) )
        eventEmmiter.on(constants.events.app.STATUS_UPDATED,        this.#onStatusChanged(components) )
    }

    async initializeTable(eventEmmiter){
        const components = new ComponentsBuilder()
            .setScreen({title: 'Hackerchat - Lucas Becker'})
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmmiter))
            .setChatComponent()
            .setActivityLogComponent()
            .setStatusComponent()
            .build()

        this.#registerEvents(eventEmmiter, components)
        components.input.focus()
        components.screen.render()
    }
}