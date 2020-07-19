import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserService } from "../services/user.service";
import { RealEstateOfferService } from "../services/real-estate-offer.service";
import { databaseValuesToSerbian } from "../shared/dictionary";
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
@Component({
  selector: 'app-real-estate-processing',
  templateUrl: './real-estate-processing.component.html',
  styleUrls: ['./real-estate-processing.component.css']
})
export class RealEstateProcessingComponent implements OnInit {
  realEstates = [];

  array: any;
  indicator: boolean = false;
  modeIndicator: number = 1; /* 1 for offered real estates and 2 for real estates in progress */
  response: any;

  constructor(private http: HttpClient,
    public userService: UserService,
    private router: Router,
    private realEstateOfferService: RealEstateOfferService,
    private notificationsService: NotificationsService) { }

  ngOnInit() {
    if (this.userService.getAdminFlag() !== true) {
      this.router.navigate(['']);
      console.log('403: Zabranjen end point!');
    }
    else {
      if (this.router.url === '/offersInProgress') {
        this.response = this.realEstateOfferService.getOffersIProcess(this.userService.getId());
        this.modeIndicator = 2;
      }
      else {
        this.response = this.realEstateOfferService.getRealEstateOffers();
        this.modeIndicator = 1;
      }
      this.response.subscribe(res => {
        for (let key in res) {
          res[key].cooperationType = databaseValuesToSerbian[res[key].cooperationType];
          res[key].city = databaseValuesToSerbian[res[key].city];
          this.realEstates.push(res[key]);
        }
        if (this.realEstates.length === 0) {
          var alertMessage = '';
          if (this.router.url === '/offersInProgress')
            alertMessage = 'Nemate nekretnine u obradi.';
          else
            alertMessage = 'Nema ponuđenih nekretnina agenciji.';
          this.router.navigate(['']);
          alert(alertMessage);
        }
        else if (this.realEstates.length % 2) {
          this.array = Array.from(new Array((this.realEstates.length - 1) / 2), (val, index) => index);
          this.indicator = true;
        }
        else {
          this.array = Array.from(new Array(this.realEstates.length / 2), (val, index) => index);
          this.indicator = false;
        }
      },
        err => {
          console.log(err);
        });
    }
  }

  onAddOffered(number: number) {
    let requestData = { _id: this.realEstates[number]._id, agentId: this.userService.getId() }
    this.realEstateOfferService.processOffer(requestData)
      .subscribe(res => {
        this.notificationsService.info("Server poruka", res.statusMessage, {
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true
        });
      },
        err => {
          this.notificationsService.error("Server poruka", err, {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        })

  }

  onDeleteOffered(number: number) {
    this.realEstateOfferService.deleteOfferRealEstate(this.realEstates[number]._id, "undefined").
      subscribe(response => {
        if (response["success"] == true) {
          this.notificationsService.info("Server poruka", response["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
          this.realEstates.splice(number, 1)
          if (this.realEstates.length % 2) {
            this.array = Array.from(new Array((this.realEstates.length - 1) / 2), (val, index) => index);
            this.indicator = true;
          }
          else {
            this.array = Array.from(new Array(this.realEstates.length / 2), (val, index) => index);
            this.indicator = false;
          }
        }
        else {
          this.notificationsService.error("Server poruka", response["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        }
      })
  }

  onAddInProgress(number: number) {
    this.realEstateOfferService.deleteOfferRealEstate(this.realEstates[number]._id, this.userService.getId()).
      subscribe(response => {
        if (response["success"] == true) {
          this.realEstates.splice(number, 1)
          if (this.realEstates.length % 2) {
            this.array = Array.from(new Array((this.realEstates.length - 1) / 2), (val, index) => index);
            this.indicator = true;
          }
          else {
            this.array = Array.from(new Array(this.realEstates.length / 2), (val, index) => index);
            this.indicator = false;
          }
          this.router.navigate(['/add-real-estate']);
        }
        else {
          this.notificationsService.error("Server poruka", response["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        }
      })
  }

  onDeleteInProgress(number: number) {
    this.realEstateOfferService.deleteOfferRealEstate(this.realEstates[number]._id, this.userService.getId()).
      subscribe(response => {
        if (response["success"] == true) {
          this.notificationsService.info("Server poruka", response["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
          this.realEstates.splice(number, 1)
          if (this.realEstates.length % 2) {
            this.array = Array.from(new Array((this.realEstates.length - 1) / 2), (val, index) => index);
            this.indicator = true;
          }
          else {
            this.array = Array.from(new Array(this.realEstates.length / 2), (val, index) => index);
            this.indicator = false;
          }
        }
        else {
          this.notificationsService.error("Server poruka", response["message"], {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
        }
      })
  }
}
