import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RealEstateOffer } from "../shared/real-estate-offer";
import { AuthorisationService } from "../services/auth.service";
import { RealEstateOfferService } from "../services/real-estate-offer.service";
import { baseURL } from "../shared/baseurl";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import * as EmailValidator from 'email-validator';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-real-estate-offer',
  templateUrl: './real-estate-offer.component.html',
  styleUrls: ['./real-estate-offer.component.css']
})


export class RealEstateOfferComponent implements OnInit {

  @ViewChild('nameparam') nameparam: ElementRef;
  @ViewChild('phoneparam') phoneparam: ElementRef;

  constructor(
    private authorisationService: AuthorisationService,
    private http: HttpClient,
    private realEstateOfferService: RealEstateOfferService,
    private userService: UserService) { }

  ngOnInit(): void {
  }

  closeOfferRealEstateForm() {
    this.offerRealEstateFormClean();
    this.empty_field();
    this.empty_error_field();
    var form = document.getElementById("offer-real-estate-id");
    var overlay = document.getElementById("overlay");
    form.classList.remove("active");
    overlay.classList.remove("active");
  }

  /* Function that sends real estate offer to the server */
  submitOfferRealEstateForm(name: string, phone: string, cooperation: string, city: string) {
    let email
    if (this.userService.getEmail() != "undefined" && this.userService.getEmail() != undefined) {
      email = this.userService.getEmail()
    }
    else {
      document.getElementById("ore-email-error").innerHTML = "Molimo ulogujte se";
      return
    }
    const offer = new RealEstateOffer(name, email, phone, cooperation, city);

    /* HTTP POST request that sends data to the server */
    this.realEstateOfferService.postRealEstateOffer(offer).subscribe((res: any) => {
      if (res.success) {
        this.empty_field();
        document.getElementById('ore-server-error-success').innerHTML = res.message;
      }
    },
      error => {
        if (error.error.message == undefined)
          document.getElementById("ore-server-error-success").innerHTML = "Molimo ulogujte se. "
        else document.getElementById("ore-server-error-success").innerHTML = error.error.message;
      })
  }

  /* Function which checks correctness of real estate offer inputs */
  checkOfferRealEstateForm(name: string, phone: string) {
    let indicator = 0;
    this.empty_error_field();

    if (this.userService.getEmail() == "undefined" || this.userService.getEmail() == undefined) {
      document.getElementById("ore-email-error").innerHTML = "Molimo ulogujte se";
      return
    }
    // ####################################### NAME CHECK ################################################
    if (name === '') {
      document.getElementById("ore-name-error").innerHTML = "Ime je obavezno";
      indicator = 1;
    }
    else if (name.length < 3 || name.length > 25) {
      document.getElementById("ore-name-error").innerHTML = "Ime mora sadrzati minimum 3 a maksimum 25 karaktera";
      indicator = 1;
    }

    if (indicator === 1)
      document.getElementById("ore-name-id").style.borderColor = "red";

    // ####################################### EMAIL CHECK ################################################
    /* if (email === '') {
      document.getElementById("ore-email-error").innerHTML = "Email je obavezan";
      indicator = 2;
    }
    else if (!EmailValidator.validate(email)) {
      document.getElementById("ore-email-error").innerHTML = "Uneli ste neispravan email";
      indicator = 2;
    }

    if (indicator === 2)
      document.getElementById("ore-email-id").style.borderColor = "red";
 */
    // ####################################### PHONE CHECK ################################################

    if (phone === '') {
      document.getElementById("ore-phone-error").innerHTML = "Telefon je obavezan";
      indicator = 2;
    }
    else if (phone.length < 9 || phone.length > 18) {
      document.getElementById("ore-phone-error").innerHTML = "Telefon mora sadrzati minimum 9 a maksimum 18 karaktera";
      indicator = 2;
    }

    if (indicator === 2)
      document.getElementById("ore-phone-id").style.borderColor = "red";

    /* The form is correct */
    if (indicator === 0)
      return true;
    else {
      return false;
    }
  }
  /* Function that resets to default inputs form of real estate offer */
  offerRealEstateFormClean() {
    document.getElementById("ore-server-error-success").innerHTML = "";
    document.getElementById("ore-name-id").innerHTML = "";
    document.getElementById("ore-phone-id").innerHTML = "";
  }
  /* Function that resets to default parameters of real estate offer */
  empty_field() {
    this.nameparam.nativeElement.value = '';
    this.phoneparam.nativeElement.value = '';
  }
  /* Function that resets to default error labels of real estate offer */
  empty_error_field() {
    document.getElementById("ore-server-error-success").innerHTML = "";
    document.getElementById("ore-server-error-success").style.borderColor = "transparent";
    document.getElementById("ore-name-error").innerHTML = "";
    document.getElementById("ore-name-id").style.borderColor = "transparent";
    document.getElementById("ore-phone-error").innerHTML = "";
    document.getElementById("ore-phone-id").style.borderColor = "transparent";
  }


}
