import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router, ActivatedRoute, Params, Data } from '@angular/router';
import { AuthorisationService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { baseURL } from '../shared/baseurl';
import { User } from '../shared/user';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user : User = new User();
  oldUser: any;
  _id: string = undefined;
  request: any = undefined;
  modeIndicator: number = 1;
  passwordFlag: boolean = false;
  oldPassword: string = '';
  newPassword: string= '';
  images:any = undefined;

  constructor(private route: ActivatedRoute, private router: Router, private userService : UserService) { 

  }

  ngOnInit() {
    this.getUser();
  }

  // function which will handle get user by id requset
  getUser(){
    this._id = this.route.snapshot.params['id'];
    if(this._id!== this.userService.getId() && this.userService.getId()!==undefined){
      this.router.navigate(['']);
      console.log('Nije Vam dozvoljeno da menjate tudje podatke!');
    }
    else{
      this.userService.getUserById(this._id)
        .subscribe(res => {
          this.oldUser = {email: res.email, firstname: res.firstname, lastname: res.lastname, 
                        phone: res.phone, description: res.description, image: res.image};
          this.user = res;
        },
        err => {
          /* The error here will not be handled by a separate function, 
          because the server's response is provided by the appropriate e-mail */
          this.router.navigate(['']);
          console.log(err);
        }) 
    }
  }

  // function which will handle change user data requests
  changeUserData(){
    if(Object.keys(this.request).length>0){
      this.request['email'] = this.user.email;
      this.userService.changeUserData(this.request)
      .subscribe(res => {
        this.request = undefined;
        this.oldUser = {email: res.user.email, firstname: res.user.firstname, lastname: res.user.lastname, 
                        phone: res.user.phone, description: res.user.description};
        this.user= res.user;
        document.getElementById("change-data-info").innerHTML = res.statusMessage;
      },
      err => {
        document.getElementById("change-data-error").innerHTML= err;
      }) 

    }
  }

  // valudation function, it won't permit request to proceed to server unless all data are validated 
  checkData() : boolean {
    let indicator = 0;
    this.backToOriginal();
    this.request = {}
    let regexpName = new RegExp(/^[A-ZŠĐŽĆČa-zšđčćž ]{2,}$/);
    let regexpPhone = new RegExp(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/);
    let regexpPassword = new RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/);

    /* ##################################### PROFILE DATA ####################################### */
    if(this.modeIndicator===1){
      /* #################################### FIRSTNAME CHECK #################################### */
      if(this.user.firstname!=this.oldUser.firstname){
        if(this.user.firstname===''){
          document.getElementById("upd-firstname-error").innerHTML = 'Ime je obavezno';
          indicator = 1;
        }
        else if(this.user.firstname.length<3){
          document.getElementById("upd-firstname-error").innerHTML = 'Ime je prekratko';
          indicator = 1;
        }
        else if(!regexpName.test(this.user.firstname)){
          document.getElementById("upd-firstname-error").innerHTML = 'Ime se sastoji samo od slova';
          indicator = 1;
        }
        else
          this.request['firstname'] = this.user.firstname;
      
        if(indicator===1)
          document.getElementById("upd-firstname").style.borderColor = "red";
      } 

    /* #################################### LASTNAME CHECK #################################### */
    if(this.user.lastname!=this.oldUser.lastname){
      if(this.user.lastname===''){
        document.getElementById("upd-lastname-error").innerHTML = 'Prezime je obavezno';
        indicator = 2;
      }
      else if(this.user.lastname.length<3){
        document.getElementById("upd-lastname-error").innerHTML = 'Prezime je prekratko';
        indicator = 2;
      }
      else if(!regexpName.test(this.user.lastname)){
        document.getElementById("upd-lastname-error").innerHTML = 'Prezime se sastoji samo od slova';
        indicator = 2;
      }
      else
        this.request['lastname'] = this.user.lastname;
    
      if(indicator===2)
        document.getElementById("upd-lastname").style.borderColor = "red";

    }

      /* #################################### PHONE CHECK #################################### */ 
      if(this.user.phone!=this.oldUser.phone){
      
        if(this.user.phone.length<9 && this.user.phone.length>0){
          document.getElementById("upd-phone-error").innerHTML = 'Neispravan broj';
          indicator = 3;
        }
        else if(!regexpPhone.test(this.user.phone)){
          document.getElementById("upd-phone-error").innerHTML = 'Broj se sastoji samo od brojeva';
          indicator = 3;
        }
        else
          this.request['phone'] = this.user.phone;

        if(indicator===2)
          document.getElementById("upd-phone").style.borderColor = "red";

      }

    }

    /* ############################## PASSWORD CHANGE ############################################ */
    if(this.modeIndicator===2){

      /* ########################### NEW PASSWORD ######################################## */
      if(this.newPassword===''){
        document.getElementById("new-password-error").innerHTML = "Lozinka je obavezna";
        indicator = 4;
      }
      else if(this.newPassword.length<8){
        document.getElementById("new-password-error").innerHTML = "Lozinka mora da sadrži 8 karaktrera";
        indicator = 4;
      }
      else if(!regexpPassword.test(this.newPassword)){
        document.getElementById("new-password-error").innerHTML = "Lozinka mora sadržati brojeve, mala i velika slova";
        indicator = 4;
      }
  
      if(indicator===4)
        document.getElementById("new-password").style.borderColor = "red"; 

        /* ############################ OLD PASSWORD ####################################### */
        if(this.oldPassword===''){
          document.getElementById("old-password-error").innerHTML = "Lozinka je obavezna";
          indicator = 3;
        }
        else if(this.oldPassword.length<8 && indicator === 0){
          indicator = 17;
          document.getElementById("change-password-error").innerHTML = "Neispravna stara lozinka";
        }
        else if(!regexpPassword.test(this.oldPassword) && indicator === 0){
          indicator = 17;
          document.getElementById("change-password-error").innerHTML = "Neispravna stara lozinka";
        }
    
        if(indicator===3)
          document.getElementById("old-password").style.borderColor = "red"; 

    }

    /* #################################### DESCRIPTION ####################################3 */
    if(this.modeIndicator===4){
      if(this.user.description!=this.oldUser.description)
        if(this.user.description===''){
          document.getElementById("change-description-error").innerHTML = "Opis je obavezan";
          this.user.description = this.oldUser.description;
          indicator = 5;
        }
        else
          this.request['description'] = this.user.description;

          if(indicator===5)
          document.getElementById("description").style.borderColor = "red";
    }


    if(indicator!==0)
      return false;
    else 
      return true;
    
  }

    // return error notifications to default
    backToOriginal(){
      if(this.modeIndicator === 1){
        document.getElementById("upd-firstname-error").innerHTML = "";
        document.getElementById("upd-lastname-error").innerHTML = "";
        document.getElementById("upd-phone-error").innerHTML = "";
        document.getElementById("change-data-info").innerHTML = "";
        document.getElementById("upd-firstname").style.borderColor = "transparent";
        document.getElementById("upd-lastname").style.borderColor = "transparent";
        document.getElementById("upd-phone").style.borderColor = "transparent";
      }
      if(this.modeIndicator===2){
        document.getElementById("old-password-error").innerHTML = "";
        document.getElementById("new-password-error").innerHTML = "";
        document.getElementById("change-password-error").innerHTML = "";
        document.getElementById("old-password").style.borderColor = "transparent";
        document.getElementById("new-password").style.borderColor = "transparent";
      }
      if(this.modeIndicator===4){
        if(this.user.admin){
          document.getElementById("change-description-error").innerHTML = "";
          document.getElementById("description").style.borderColor = "transparent";
        }
      }

      if(this.modeIndicator===3){
        document.getElementById("change-photo-error").innerHTML = "";
      }

    }

    // function which will set indicator to appropriate mode of profile maintenance 
    setIndicator(number: number){
      this.modeIndicator = number;
      if(number===2){
        this.oldPassword='';
        this.newPassword='';
        this.passwordFlag=false;
      }
      if(number===1){
        this.user.firstname=this.oldUser.firstname;
        this.user.lastname=this.oldUser.lastname;
        this.user.phone=this.oldUser.phone;
      }
	  
    }

    // function which will change show-hide password indicator
    changePasswordFlag(){
      this.passwordFlag=!this.passwordFlag;
    }

    // function which will handle change password request
    changePassword(){
        this.userService.changePassword(
        {email: this.user.email, oldpassword: this.oldPassword, newpassword: this.newPassword})
        .subscribe(res => {
          document.getElementById("change-password-error").innerHTML = res.statusMessage;
        },
        err => {
            document.getElementById("change-password-error").innerHTML= err;
        })   
    }

    // function which will handle change description request
    changeDescription(){
      if(Object.keys(this.request).length>0){
        this.request['email'] = this.user.email;
        this.userService.changeDescription(this.request)
        .subscribe(res => {
          this.request = undefined;
          this.oldUser.description = res.user.description;
          this.user= res.user;
          document.getElementById("change-description-error").innerHTML = res.statusMessage;
        },
        err => {
            document.getElementById("change-description-error").innerHTML= err;
        }) 
  
      }
    }

    // select image function
    selectImage(event) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        this.images = file;
        (document.getElementById("img-input-name") as HTMLInputElement).value = file.name;
      }
    }

    // function which will handle change user photo request
    onSubmit(){
      if(this.images===undefined && (document.getElementById("img-input-name") as HTMLInputElement).value===''){
        document.getElementById("change-photo-error").innerHTML=  'Niste uneli nijednu sliku'; 
      }
      else if (this.images===undefined){
        document.getElementById("change-photo-error").innerHTML=  'Slika je već promenjena'; 
      }
      else{
        const formData = new FormData();
        formData.append('imageFile', this.images);
        formData.append('_id', this.user._id);
      
        this.userService.changePhoto(formData).subscribe(
        (res) => {
          if(this.oldUser.image !=res.image){
          this.oldUser.image = res.image;
          this.user.image = res.image;
          }
          document.getElementById("change-photo-error").innerHTML= res.statusMessage;
          this.images=undefined;
          },
        (err) =>{ 
          document.getElementById("change-photo-error").innerHTML= err; 
        });
      }
    }
    
}