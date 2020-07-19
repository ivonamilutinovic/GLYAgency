import { Component, OnInit, OnDestroy, AfterViewInit, Renderer2, ElementRef, ViewChild, HostListener } from '@angular/core';
import * as io from 'socket.io-client';
import { NotificationsService } from 'angular2-notifications';
import { Router } from '@angular/router';
import { socketURL } from '../shared/socket-url'
import { CanComponentDeactivate } from '../services/auth.guard';
@Component({
  selector: 'app-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.css']
})

export class SupportChatComponent implements OnInit, AfterViewInit, OnDestroy, CanComponentDeactivate {

  @ViewChild('people', { read: ElementRef }) people: ElementRef;
  @ViewChild('write', { read: ElementRef }) write: ElementRef;
  @ViewChild('conversation', { read: ElementRef }) conversation: ElementRef;
  @ViewChild('input', { read: ElementRef }) input: ElementRef;
  @ViewChild('forminput', { read: ElementRef }) formInput: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  handleClose($event) {
    if (document.querySelector('li.person') != null)
      $event.returnValue = false;
  }

  //www.flaticon.com
  USER_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";
  adminFlag = false
  readyToSend = true
  socket
  socketIdToCounter = {}
  counterToSocketId = {}
  counter = 1

  constructor(
    private renderer: Renderer2,
    private elem: ElementRef,
    private notificationsService: NotificationsService,
    private router: Router) { }

  ngOnInit() {
    //document.querySelector('.chat').classList.add('active-chat')
    //document.querySelector('.person').classList.add('active')
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  canDeactivate() {
    if (document.querySelector('li.person') == null) {
      return true
    }
    else {
      return confirm('Da li ste sigurni da želite da napustite stranicu? Izgubićete sve aktivne četove!');
    }
  }

  ngAfterViewInit() {
    this.socket = io(socketURL)
    this.socket.emit('agent');

    if (this.formInput)
      this.formInput.nativeElement.addEventListener("submit", event => {
        event.preventDefault();

        const msgText = (this.input.nativeElement as HTMLInputElement).value;
        if (!msgText) return;

        let personSelector = document.querySelector('ul.people')
        let activePerson: HTMLElement = personSelector.querySelector('.active')

        if (activePerson == null)
          return
        let id = activePerson.dataset.chat
        let socketId = this.counterToSocketId[id]
        this.newMessage(socketId, "me", msgText);

        this.socket.emit('agentToUser', msgText, socketId);

        (this.input.nativeElement as HTMLInputElement).value = "";
      });

    this.input.nativeElement.addEventListener("keyup", (e) => {
      if (this.readyToSend == true && e.key != 'Enter') {
        let p = document.querySelector('ul.people')
        let activePerson: HTMLElement = p.querySelector('.active')
        if (activePerson == null)
          return

        let id = activePerson.dataset.chat
        let socketId = this.counterToSocketId[id]
        this.readyToSend = false
        this.socket.emit('typing', socketId);
        setTimeout(() => {
          this.readyToSend = true
        }, 10000);
      }
    });

    this.socket.on('userToAgent', (msg: string, socketId: string) => {
      this.newMessage(socketId, "you", msg)

      let userChat = document.querySelector(`.person[data-chat="${this.socketIdToCounter[socketId]}"]`)
      if (!userChat.classList.contains('active')) {
        const toast = this.notificationsService.info(this.socketIdToCounter[socketId], msg, {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true
        });
        toast.click.subscribe(() => {
          this.setActiveChat(userChat)
        });
      }
    });

    this.socket.on('initChat', (socketId: string) => {
      this.socketIdToCounter[socketId] = this.counter
      this.counterToSocketId[this.counter++] = socketId
      this.addPersonLeft(socketId);
      this.addInitConversation(socketId);
    });

    this.socket.on('agentChatFull', () => {
      alert('Kolega aktivan na četu');
      this.router.navigate(['']);
    })

    this.socket.on('endChat', (socketId: string) => {

      let userChat = document.querySelector(`.person[data-chat="${this.socketIdToCounter[socketId]}"]`)
      //if (this.people.nativeElement == null)
      // return
      // this.renderer.removeChild(this.people.nativeElement, userChat)
      this.renderer.removeChild(userChat.parentNode, userChat)

      let chatConversation = document.querySelector(`.chat[data-chat="${this.socketIdToCounter[socketId]}"]`)
      this.renderer.removeChild(this.conversation.nativeElement, chatConversation)

      //let firstChat = document.querySelector('.person')
      //let activeChat = document.querySelector('li.person.active')
      if (userChat.classList.contains('active')) {
        document.querySelector('.container .right .top .name').innerHTML = "";
        this.notificationsService.warn(this.socketIdToCounter[socketId], "Korisnik je napustio chat", {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true
        });
      }

      let counter = this.socketIdToCounter[socketId]
      delete this.socketIdToCounter[socketId]
      delete this.counterToSocketId[counter];
    })

  }

  setActiveChat(f) {
    if (document.querySelector('ul.people .active') != null)
      document.querySelector('ul.people .active').classList.remove('active');
    f.classList.add('active');
    if (document.querySelector('.container .right .active-chat'))
      document.querySelector('.container .right .active-chat').classList.remove('active-chat');
    document.querySelector('.container .right [data-chat="' + f.getAttribute('data-chat') + '"]').classList.add('active-chat')
    document.querySelector('.container .right .top .name').innerHTML = f.querySelector('.name').innerText;
  }

  addPersonLeft(socketId) {
    const li = this.renderer.createElement('li')
    this.renderer.addClass(li, "person")
    this.renderer.setAttribute(li, "data-chat", this.socketIdToCounter[socketId]);
    li.addEventListener('mousedown', () => {
      li.classList.contains('active') || this.setActiveChat(li)
    });
    this.renderer.appendChild(this.people.nativeElement, li);

    const img = this.renderer.createElement('img')
    img.src = this.USER_IMG;
    this.renderer.appendChild(li, img);

    let span1 = this.renderer.createElement('span');
    this.renderer.addClass(span1, "name")
    const span1text = this.renderer.createText(this.socketIdToCounter[socketId])
    this.renderer.appendChild(span1, span1text);
    this.renderer.appendChild(li, span1);

    let span2 = this.renderer.createElement('span');
    this.renderer.addClass(span2, "time")
    const span2text = this.renderer.createText(`${this.formatDate(new Date())}`)
    this.renderer.appendChild(span2, span2text);
    this.renderer.appendChild(li, span2);

    let span3 = this.renderer.createElement('span');
    this.renderer.addClass(span3, "preview")
    const span3text = this.renderer.createText('Nema poruka')
    this.renderer.appendChild(span3, span3text);
    this.renderer.appendChild(li, span3);
  }


  addInitConversation(socketId) {
    const div = this.renderer.createElement('div')
    this.renderer.addClass(div, "chat")
    this.renderer.setAttribute(div, "data-chat", this.socketIdToCounter[socketId]);
    this.renderer.insertBefore(this.conversation.nativeElement, div, this.write.nativeElement)

    const div2 = this.renderer.createElement('div')
    this.renderer.addClass(div2, "conversation-start")
    this.renderer.appendChild(div, div2);

    let span = this.renderer.createElement('span');
    const spanText = this.renderer.createText(`${this.formatDate(new Date())}`);
    this.renderer.appendChild(span, spanText);
    this.renderer.appendChild(div2, span);
  }


  chatOnTop(socketId, message) {
    let newMessagePerson = document.querySelector(`.person[data-chat="${this.socketIdToCounter[socketId]}"]`);

    let spanPreview = newMessagePerson.querySelector('.preview')
    //let previewText = document.createTextNode(message);
    spanPreview.textContent = message;

    let spanTime = newMessagePerson.querySelector('.time')
    //let timeText = document.createTextNode(`${this.formatDate(new Date())}`);
    spanTime.textContent = `${this.formatDate(new Date())}`;

    //this.renderer.removeChild(newMessagePerson, newMessagePerson.querySelector('.time'));
    //this.renderer.appendChild(newMessagePerson, this.renderer.createText(`${this.formatDate(new Date())}`));

    //this.renderer.removeChild(newMessagePerson, newMessagePerson.querySelector('.preview'));
    //this.renderer.appendChild(newMessagePerson, message);

    let firstPerson = document.querySelector('.person')
    if (firstPerson != newMessagePerson) {
      this.renderer.removeChild(this.people.nativeElement, newMessagePerson);
      this.renderer.insertBefore(this.people.nativeElement, newMessagePerson, firstPerson);
    }
  }

  newMessage(socketId, youOrMe, message) {
    const div = this.renderer.createElement('div')
    this.renderer.addClass(div, `bubble`)
    this.renderer.addClass(div, `${youOrMe}`)
    const msg = this.renderer.createText(message)
    this.renderer.appendChild(div, msg)

    let newMessagePerson = document.querySelector(`.chat[data-chat="${this.socketIdToCounter[socketId]}"]`)
    if (newMessagePerson)
      this.renderer.appendChild(newMessagePerson, div);
    else
      return
    this.chatOnTop(socketId, message)
  }

  formatDate(date) {
    const hours = "0" + date.getHours();
    const minutes = "0" + date.getMinutes();
    return `${hours.slice(-2)}:${minutes.slice(-2)}`;
  }

}





