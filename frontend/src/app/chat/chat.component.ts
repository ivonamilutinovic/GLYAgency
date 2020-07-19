import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit, HostListener } from '@angular/core';
import * as io from 'socket.io-client';
import { NotificationsService } from 'angular2-notifications';
import { AuthorisationService } from "../services/auth.service";
import Swal from 'sweetalert2';
import * as EmailValidator from 'email-validator';
import { socketURL } from '../shared/socket-url';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, AfterViewInit {

  @ViewChild('msgerchat', { read: ElementRef }) msgerChat: ElementRef;
  @ViewChild('msgerinput', { read: ElementRef }) msgerInput: ElementRef;
  @ViewChild('msgerinputarea', { read: ElementRef }) msgerForm: ElementRef;
  @ViewChild('chatsection', { read: ElementRef }) chatSection: ElementRef;
  @ViewChild('typing', { read: ElementRef }) typing: ElementRef;

  @HostListener('window:beforeunload', ['$event'])
  handleClose($event) {
    if (this.activeChat == true)
      $event.returnValue = false;
  }

  activeChat = false
  permissionChat = true
  socketInit = false
  adminFlag;
  isLoggedIn;
  timeout;
  socket;
  hiddenChat = true
  AGENCY_SUPPORT_NAME = "GLI Agency";
  USER_NAME = "Ja";
  // www.flaticon.com
  AGENCY_SUPPORT_IMG = "https://image.flaticon.com/icons/svg/327/327779.svg";
  USER_IMG = "https://image.flaticon.com/icons/svg/145/145867.svg";


  constructor(
    private authService: AuthorisationService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private notificationsService: NotificationsService) {
  }

  ngOnInit() {
    this.authService.getAdminFlag().subscribe(flag => {
      this.adminFlag = flag
    })
  }

  ngAfterViewInit() {
  }

  appendMessage(name, img, side, text) {

    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, `msg`);
    this.renderer.addClass(div, `${side}-msg`);
    this.renderer.appendChild(this.msgerChat.nativeElement, div);

    const div2 = this.renderer.createElement('div')
    this.renderer.addClass(div2, "msg-img");
    this.renderer.setStyle(div2, 'background-image', `url(${img})`);
    this.renderer.appendChild(div, div2);

    const div3 = this.renderer.createElement('div')
    this.renderer.addClass(div3, "msg-bubble");
    this.renderer.appendChild(div, div3);

    const div4 = this.renderer.createElement('div')
    this.renderer.addClass(div4, "msg-info");
    this.renderer.appendChild(div3, div4);

    const div5 = this.renderer.createElement('div')
    this.renderer.addClass(div5, "msg-info-name");
    const div5text = this.renderer.createText(`${name}`)
    this.renderer.appendChild(div5, div5text);
    this.renderer.appendChild(div4, div5);

    const div6 = this.renderer.createElement('div')
    this.renderer.addClass(div6, "msg-info-time");
    const div6text = this.renderer.createText(`${this.formatDate(new Date())}`)
    this.renderer.appendChild(div6, div6text);
    this.renderer.appendChild(div4, div6);

    const div7 = this.renderer.createElement('div')
    this.renderer.addClass(div7, "msg-text");
    const div7text = this.renderer.createText(`${text}`)
    this.renderer.appendChild(div7, div7text);
    this.renderer.appendChild(div3, div7);

    this.msgerChat.nativeElement.scrollTop += 400;
  }

  formatDate(date) {
    const hours = "0" + date.getHours();
    const minutes = "0" + date.getMinutes();

    return `${hours.slice(-2)}:${minutes.slice(-2)}`;
  }

  showIt() {
    if (this.socketInit == false) {
      this.socket = io(socketURL);
      this.socketInit = true;
      var overlay = document.getElementById("overlay");
      this.socket.on("access", (permission) => {
        if (permission) {
          this.activeChat = true
          this.permissionChat = true
          if (this.msgerForm)
            this.msgerForm.nativeElement.addEventListener("submit", event => {
              event.preventDefault();
              const msgText = (this.msgerInput.nativeElement as HTMLInputElement).value;
              if (!msgText)
                return;

              this.appendMessage(this.USER_NAME, this.USER_IMG, "right", msgText);
              this.socket.emit('message', msgText);
              (this.msgerInput.nativeElement as HTMLInputElement).value = "";
            });

          this.socket.on("typing", () => {
            (this.typing.nativeElement as HTMLInputElement).value = this.AGENCY_SUPPORT_NAME + " is typing...";
            setTimeout(() => {
              (this.typing.nativeElement as HTMLInputElement).value = "";
            }, 5000)
          })

          this.socket.on("chatToForm", () => {
            this.mailForm(overlay, 'Došlo je do iznenadne greške, molimo na ovoj stranici unesite Vaš email a na sledećoj pitanje')
          })

          this.socket.on('message', (msg: string) => {
            this.appendMessage(this.AGENCY_SUPPORT_NAME, this.AGENCY_SUPPORT_IMG, "left", msg)
            if (this.chatSection.nativeElement.style.display == "none") {
              const toast = this.notificationsService.info(this.AGENCY_SUPPORT_NAME, msg, {
                timeOut: 5000,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: true
              });
              toast.click.subscribe(() => {
                this.showIt();
              });
            }
          });
          this.chatSection.nativeElement.style.display = "block"
        }
        else {
          this.mailForm(overlay, 'Korisnička služba trenutno nije dostupna. Molimo Vas da unesete Vaš email na ovoj stranici, a na narednoj pitanje.')
        }
      })
    }
    else if (this.permissionChat) {
      if (this.chatSection.nativeElement.style.display == "block")
        this.chatSection.nativeElement.style.display = "none";
      else
        this.chatSection.nativeElement.style.display = "block";
    }
  }
  removeTyping() {
    (this.typing.nativeElement as HTMLInputElement).value = "";
  }

  mailForm(overlay, msg) {
    this.permissionChat = false;
    this.activeChat = false
    overlay.classList.add("active_chat");
    Swal.mixin({
      input: 'text',
      inputValidator: (value) => {
        return !value && 'Molimo popunite polje!'
      },
      confirmButtonText: 'Sledeće &rarr;',
      confirmButtonColor: '#5c5b51',
      cancelButtonColor: '#960005',
      showCancelButton: true,
      cancelButtonText: 'Zatvorite',
      progressSteps: ['1', '2'],
      allowOutsideClick: false,
    }).queue([
      {
        title: msg,
        inputValidator: (value) => {
          return !EmailValidator.validate(value) && 'Molimo popunite polje ispravnim mejlom!'
        },
      },
      {
        title: 'Unesite Vaše pitanje',
        inputValidator: (value) => {
          return !value && 'Molimo unesite Vaše pitanje.'
        },
      },
    ]).then((result) => {
      if (result.value) {
        const answers = JSON.stringify(result.value)
        const mailForm = {
          "email": result.value[0],
          "question": result.value[1]
        }
        this.socket.emit('mailForm', mailForm);
        Swal.fire({
          title: 'Hvala na poverenju, očekujte brz odgovor!',
          html: `
              Uneti podaci:
              <pre><code>${answers}</code></pre>
            `,
          confirmButtonText: 'Zatvori',
          confirmButtonColor: '#960005',
          allowOutsideClick: false,
        }).then(() => {
          overlay.classList.remove("active_chat");
        })
      }
      else {
        overlay.classList.remove("active_chat");
      }
    }).catch(error => {
      overlay.classList.remove("active_chat");
      console.log(error);
    })
  }
}
