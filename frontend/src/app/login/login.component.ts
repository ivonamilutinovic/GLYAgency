import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { AuthorisationService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LogInComponent implements OnInit {
  
  passwordFlag : boolean = false
  user = {email: '', password: ''};
  @ViewChild('emailparam') emailparam: ElementRef;
  @ViewChild('passwordparam') passwordparam: ElementRef;
   
  constructor(private authorisationService: AuthorisationService) { }

  ngOnInit(){
	  
  }

  // function which will redirect user to sign up form
  changeToSignUpForm(element : string){
	  this.backToOriginal();
	  this.empty_field();
	  this.passwordFlag = false
    if(element === "sign-up-id")
      this.closeLogInForm("log-in-id");
    var form = document.getElementById(element);
    var overlay = document.getElementById("overlay");
    form.classList.add("active");
    overlay.classList.add("active");
  }

  // function which will close sign up form
  closeLogInForm(element : string){
    this.backToOriginal();
	  this.passwordFlag = false
    var form = document.getElementById(element);
    var overlay = document.getElementById("overlay");
    form.classList.remove("active");
    overlay.classList.remove("active");
  }
  
  // password flag function, for show-hide password functionality
  changePasswordFlag(){
	  this.passwordFlag = !this.passwordFlag;
  }
  
  // function which will validate inserted user information
  checkLogInData(email : string, password : string){
    this.backToOriginal();
    var indicator = 1;

    var regexpEmail = new RegExp(/[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    if(email===''){
      document.getElementById("email-error").innerHTML = "Email je obavezan";
      indicator = 0;
    }
    else if(!regexpEmail.test(email)){
      document.getElementById("email-error").innerHTML = "Uneli ste neispravan email";
      indicator = 0;
    }

    if(indicator===0)
      document.getElementById("email").style.borderColor = "red"; 

    let regexpPassword = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);
    if(password===''){
      document.getElementById("password-error").innerHTML = "Lozinka je obavezna";
      indicator = -1;
    }
    else if(password.length<8 && indicator !== 0){
      document.getElementById("login-error").innerHTML = "Neispravan je email ili lozinka";
      indicator = 2;
    }
    else if(!regexpPassword.test(password) && indicator !== 0){
     document.getElementById("login-error").innerHTML = "Neispravan je email ili lozinka";
      indicator = 2;
    }

    if(indicator===-1)
      document.getElementById("password").style.borderColor = "red"; 

    if(indicator===1)
      return true;
    else
      return false;
  } 

  // return error notifications to default
  backToOriginal(){
    document.getElementById("email-error").innerHTML = "";
    document.getElementById("password-error").innerHTML = "";
	  document.getElementById("login-error").innerHTML = "";
    document.getElementById("email").style.borderColor = "transparent";
    document.getElementById("password").style.borderColor = "transparent";
  }
  
  // log in function dependent on authorisation service
  logIn(email : string, password: string){
	  this.user.email = email;
	  this.user.password = password;
    this.authorisationService.logIn(this.user)
      .subscribe(res => {
        if (res.success) {
		      this.empty_field();	
          this.closeLogInForm('log-in-id');		 
        } else {
		      document.getElementById("login-error").innerHTML = res;
        }
      },
      error => {
	  	  document.getElementById("login-error").innerHTML = error;
      });
  }
  
  // return form fields to default  
  empty_field(){
	  this.emailparam.nativeElement.value = '';
	  this.passwordparam.nativeElement.value = '';   
  }
  

}

