import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { baseURL } from '../shared/baseurl';
import { AuthorisationService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignUpComponent implements OnInit {
  
  passwordFlag1 : boolean = false
  passwordFlag2 : boolean = false
  user = {email: '', firstname: '', lastname: '' , password: ''};
  @ViewChild('newemailparam') newemailparam: ElementRef;
  @ViewChild('firstnameparam') firstnameparam: ElementRef;
  @ViewChild('lastnameparam') lastnameparam: ElementRef;
  @ViewChild('newpasswordparam') newpasswordparam: ElementRef;
  @ViewChild('confirmpasswordparam') confirmpasswordparam: ElementRef;


  constructor(private authorisationService: AuthorisationService) { }
  
  ngOnInit(){
  }

  // function which will close sign up form
  closeSignUpForm(element : string){
	  this.passwordFlag1 = false;
  	this.passwordFlag2 = false;
    this.backToOriginal();
    var form = document.getElementById(element);
    var overlay = document.getElementById("overlay");
    form.classList.remove("active");
    overlay.classList.remove("active");;
  }
  
  // password flag function, for show-hide password functionality
  changePasswordFlag(value: number){
    if (value===1)
      this.passwordFlag1 = !this.passwordFlag1;
    if(value===2)
      this.passwordFlag2 = !this.passwordFlag2;
  }
  
  // function which will validate inserted user information
  checkSignUpData(email: string, firstname: string, lastname: string, password: string, confirmpassword: string){
    this.backToOriginal();
    var indicator = 0;

    // ####################################### EMAIL CHECK ################################################
    
    var regexpEmail = new RegExp(/[A-Za-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
    if(email===''){
      document.getElementById("newemail-error").innerHTML = "Email je obavezan";
      indicator = 1;
    }
    else if(!regexpEmail.test(email)){
      document.getElementById("newemail-error").innerHTML = "Uneli ste neispravan email";
      indicator = 1;
    }

    if(indicator===1)
      document.getElementById("newemail").style.borderColor = "red"; 

    // ####################################### FIRSTNAME CHECK ################################################

    if(firstname===''){
      document.getElementById("firstname-error").innerHTML = "Ime je obavezno";
      indicator = 2;
    }

    if(indicator===2)
      document.getElementById("firstname").style.borderColor = "red";

    // ####################################### LASTNAME CHECK ################################################  

    if(lastname===''){
      document.getElementById("lastname-error").innerHTML = "Prezime je obavezno";
      indicator = 3;
    }

    if(indicator===3)
      document.getElementById("lastname").style.borderColor = "red";

    // ####################################### PASSWORD CHECK ################################################

    let regexpPassword = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);
    if(password===''){
      document.getElementById("newpassword-error").innerHTML = "Lozinka je obavezna";
      indicator = 4;
    }
    else if(password.length<8){
      document.getElementById("newpassword-error").innerHTML = "Lozinka mora da sadrži 8 karaktrera";
      indicator = 4;
    }
    else if(!regexpPassword.test(password)){
      document.getElementById("newpassword-error").innerHTML = "Lozinka mora sadržati brojeve, mala i velika slova";
      indicator = 4;
    }

    if(indicator===4)
      document.getElementById("newpassword").style.borderColor = "red"; 

    // ################################# CONFIRMPASSWORD CHECK #############################################
    
    if(confirmpassword===''){
      document.getElementById("confirmpassword-error").innerHTML = "Potvrda lozinke je obavezna";
      indicator = 5;
    }
    else if(password!==confirmpassword){
      document.getElementById("confirmpassword-error").innerHTML = "Lozinke se ne poklapaju";
      indicator = 5;
    }

    if(indicator===5)
      document.getElementById("confirmpassword").style.borderColor = "red"; 

    if(indicator===0)
      return true;
    else
      return false;
  } 

  // sign up function dependent on authorisation service
  signUp(email : string, firstname: string, lastname: string, password: string){
	 
	 this.user.email = email;
	 this.user.password = password;
	 this.user.firstname = firstname;
	 this.user.lastname = lastname;
   this.authorisationService.signUp(this.user)
      .subscribe(res => {
        if (res.success) {
          this.empty_field();
		      document.getElementById("signup-error").innerHTML = "Uspešno ste se registrovali";
        } 
      },
      error => {
		    document.getElementById("signup-error").innerHTML = error;
      });
	  
  }

  // return error notifications to default
  backToOriginal(){
    document.getElementById("newemail-error").innerHTML = "";
    document.getElementById("firstname-error").innerHTML = "";
    document.getElementById("lastname-error").innerHTML = "";
    document.getElementById("newpassword-error").innerHTML = "";
	  document.getElementById("signup-error").innerHTML = "";
    document.getElementById("confirmpassword-error").innerHTML = "";
    document.getElementById("newemail").style.borderColor = "transparent";
    document.getElementById("firstname").style.borderColor = "transparent";
    document.getElementById("lastname").style.borderColor = "transparent";
    document.getElementById("newpassword").style.borderColor = "transparent";
    document.getElementById("confirmpassword").style.borderColor = "transparent";
  }
  
  // return form fields to default 
  empty_field(){
	  this.newemailparam.nativeElement.value = '';
	  this.firstnameparam.nativeElement.value = '';  
	  this.lastnameparam.nativeElement.value = '';
	  this.newpasswordparam.nativeElement.value = ''; 
	  this.confirmpasswordparam.nativeElement.value = '';
  }

}

