import { Component, OnInit, ElementRef, ViewChild, NgZone, AfterViewInit } from '@angular/core';
import { AddRealEstateService } from '../services/add-real-estate.service';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NotificationsService } from 'angular2-notifications';
import {
  HTMLElementIdToDatabaseKeys, HTMLElementIdToDatabaseSubkeys, HTMLElementIdToDatabaseValues,
  HTMLElementIdToErrorFieldInnerText, HTMLSelectValueToDatabaseValue
} from '../shared/dictionary'

@Component({
  selector: 'app-real-estate-image-upload',
  templateUrl: './add-real-estate.component.html',
  styleUrls: ['./add-real-estate.component.css']
})
export class AddRealEstateComponent implements OnInit, AfterViewInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  extensions = {
    "image/png": ".png",
    "image/jpg": ".jpg",
    "image/jpeg": ".jpeg"
  };


  isCityBg = true
  isCooperationSale = true
  //MAX_ALLOWED_UPLOAD_PHOTO_SIZE = 1024 * 1024
  progress: number = 0;
  showPreview = true;
  form: FormGroup;


  constructor(
    public fb: FormBuilder,
    private photoUploadService: AddRealEstateService,
    private imageCompress: NgxImageCompressService,
    private notificationsService: NotificationsService,
    private zone: NgZone) {
    this.form = this.fb.group({
      avatar: [null]
    })
  }


  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

  onChangeCooperationType(cooperation) {
    this.isCooperationSale = cooperation == "sale"
  }
  onChangeCity(city) {
    this.isCityBg = city == "bg"
  }

  uploadPhoto(event) {
    this.showPreview = true
    this.progress = 0
    document.getElementById("img-input-id-error").innerHTML = ""

    let photo = event.target.files[0]
    if (!(photo.type in this.extensions)) {
      (document.getElementById("img-input-name") as HTMLInputElement).value = "Molimo unesite sliku sa ekstenzijom png, jpeg ili jpg. "
      return
    }

    //Without compression
    /* this.form.patchValue({
      avatar: file
    }); */

    this.form.get('avatar').updateValueAndValidity()

    var reader = new FileReader();
    reader.readAsDataURL(photo);
    reader.onload = (event: any) => {
      (document.getElementById("img-input-name") as HTMLInputElement).value = photo.name;
      document.getElementById("img-upload").setAttribute('src', reader.result.toString())
      //if (photo.size > this.MAX_ALLOWED_UPLOAD_PHOTO_SIZE)
      this.compressImage(event.target.result, photo.type);
    }
  }


  submitRealEstate() {

    this.clearErrors();

    if (this.form.value.avatar == null) {
      document.getElementById("img-input-id-error").innerHTML = "Molimo izaberite sliku nekretnine"
      return
    }

    let postRequest = {};

    postRequest["additionalSpace"] = []
    postRequest["pets"] = []
    postRequest["parking"] = []

    postRequest["realEstateEquipment"] = {}
    postRequest["buildingEquipment"] = {}

    let requiredSaleInputIds = ["minimum-renting-period-id", "deposit-id"]
    let requiredInputsIds = ["street-id", "price-id", "m2-id", "floor-id", "total-number-of-floors-id",
      "year-of-building-id", "distance-from-center-of-city-id", "description-id", "infostan-costs-id",
      "heating-costs-id"]

    let badInputs = false

    let allInputs = (document.querySelectorAll('.so-input'));
    for (let i = 0; i < allInputs.length; i++) {
      let inputValue = (allInputs[i] as HTMLInputElement).value
      if (inputValue != "") {
        postRequest[HTMLElementIdToDatabaseKeys[(allInputs[i]).id]] = inputValue;
      }
      else if (requiredInputsIds.includes((allInputs[i]).id)) {
        document.getElementById(allInputs[i].id + "-error").innerHTML =
          HTMLElementIdToErrorFieldInnerText[(allInputs[i]).id] + " je obavezno polje"
        badInputs = true
      }
      else if (this.isCooperationSale == false && (requiredSaleInputIds.includes((allInputs[i]).id))) {
        document.getElementById(allInputs[i].id + "-error").innerHTML =
          HTMLElementIdToErrorFieldInnerText[(allInputs[i]).id] + " je obavezno polje"
        badInputs = true
      }
    }

    const buildingYear = Number((document.getElementById("year-of-building-id") as HTMLInputElement).value)
    if (buildingYear < 1950 || buildingYear > new Date().getFullYear()) {
      badInputs = true;
      (document.getElementById("year-of-building-id-error") as HTMLInputElement).innerHTML =
        "Godina gradnje mora biti između 1950. i trenutne godine. "
    }

    if (Number((document.getElementById("floor-id") as HTMLInputElement).value) >
      Number((document.getElementById("total-number-of-floors-id") as HTMLInputElement).value)) {
      badInputs = true;
      (document.getElementById("total-number-of-floors-id-error") as HTMLInputElement).innerHTML =
        "Ukupan broj spratova ne moze biti veći od sprata na kome se nalazi nekretnina. "
    }

    if (badInputs) {
      document.getElementById("img-input-id-error").innerHTML = "Molimo popunite ispravno sva obavezna polja"
      return
    }
    let selectsByValue = (document.querySelectorAll('select.sel-sel'))
    for (let i = 0; i < selectsByValue.length; i++) {
      let selectedValue = (selectsByValue[i] as unknown as HTMLInputElement).value
      let requestValue = HTMLSelectValueToDatabaseValue[selectedValue] == undefined ? selectedValue : HTMLSelectValueToDatabaseValue[selectedValue]
      postRequest[HTMLElementIdToDatabaseKeys[(selectsByValue[i]).id]] = requestValue;
    }

    let additionalSpaceDOMInputs = (document.querySelectorAll('.sel-arr-add-space input'))
    for (let i = 0; i < additionalSpaceDOMInputs.length; i++) {
      let currentAdditionalSpaceCheckbox = (additionalSpaceDOMInputs[i] as unknown as HTMLInputElement).checked
      if (currentAdditionalSpaceCheckbox)
        postRequest["additionalSpace"].push(HTMLElementIdToDatabaseValues[(additionalSpaceDOMInputs[i]).id]);
    }

    let petsDOMInputs = (document.querySelectorAll('.sel-arr-pets input'))
    for (let i = 0; i < petsDOMInputs.length; i++) {
      let currentPetsCheckbox = (petsDOMInputs[i] as unknown as HTMLInputElement).checked
      if (currentPetsCheckbox) {
        postRequest["pets"].push(HTMLElementIdToDatabaseValues[(petsDOMInputs[i]).id]);
      }
    }

    let parkingDOMInputs = (document.querySelectorAll('.sel-arr-parking input'))
    for (let i = 0; i < parkingDOMInputs.length; i++) {
      let currentParkingCheckbox = (parkingDOMInputs[i] as unknown as HTMLInputElement).checked
      if (currentParkingCheckbox)
        postRequest["parking"].push(HTMLElementIdToDatabaseValues[(parkingDOMInputs[i]).id]);
    }

    let realEstateEquipmentDOMCheckBoxes = (document.querySelectorAll('.sel-dic-rs input'))
    for (let i = 0; i < realEstateEquipmentDOMCheckBoxes.length; i++) {
      let currentRealEstateEquipmentCheckbox = (realEstateEquipmentDOMCheckBoxes[i] as unknown as HTMLInputElement).checked
      if (currentRealEstateEquipmentCheckbox)
        postRequest["realEstateEquipment"][HTMLElementIdToDatabaseSubkeys[(realEstateEquipmentDOMCheckBoxes[i]).id]] = true
    }

    let buildingEquipmentDOMCheckBoxes = (document.querySelectorAll('.sel-dic-ob input'))
    for (let i = 0; i < buildingEquipmentDOMCheckBoxes.length; i++) {
      let currentBuildingEquipmentCheckbox = (buildingEquipmentDOMCheckBoxes[i] as unknown as HTMLInputElement).checked
      if (currentBuildingEquipmentCheckbox)
        postRequest["buildingEquipment"][HTMLElementIdToDatabaseSubkeys[(buildingEquipmentDOMCheckBoxes[i]).id]] = true
    }

    this.photoUploadService.setRealEstateForm(postRequest)

    this.photoUploadService.upload(
      this.form.value.avatar
    ).subscribe((event: HttpEvent<any>) => {
      switch (event.type) {
        case HttpEventType.Sent:
          console.log('Zahtev je poslat ');
          break;
        case HttpEventType.ResponseHeader:
          console.log('Primljeno zaglavlje ');
          break;
        case HttpEventType.UploadProgress:
          this.zone.run(() => {
            this.progress = Math.round(event.loaded / event.total * 100);
          })
          break;
        case HttpEventType.Response:
          this.notificationsService.success("Server poruka", "Nekretnina uspešno uneta u bazu", {
            timeOut: 5000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: true
          });
          this.progress = 0;
          this.clearErrors();
          this.clearInputFields();
          this.uncheckCheckBoxes();
          (document.getElementById("img-input-name") as HTMLInputElement).value = "";
          this.showPreview = false
      }
    }, null, () => { this.progress = 0; })
  }

  compressImage(image, type) {
    var orientation = -1;
    this.imageCompress.compressFile(image, orientation, 50, 50).then(
      result => {
        const imageBlob = this.encodedImagetoBlob(result.split(',')[1], type);
        this.form.patchValue({
          avatar: imageBlob
        });
      });
  }

  encodedImagetoBlob(encodedString, type) {
    const byteString = window.atob(encodedString);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: type });
    return blob;
  }

  clearErrors() {
    let errorsInnerHTML = (document.querySelectorAll('.sre-error'))
    for (let i = 0; i < errorsInnerHTML.length; i++) {
      (errorsInnerHTML[i] as unknown as HTMLInputElement).innerHTML = ""
    }
  }

  clearInputFields() {
    (document.getElementById("description-id") as HTMLInputElement).value = "";
    let inputs = (document.querySelectorAll('input'))
    for (let i = 0; i < inputs.length; i++) {
      (inputs[i] as unknown as HTMLInputElement).value = ""
    }
  }

  uncheckCheckBoxes() {
    var checkedBoxes = document.querySelectorAll('input[type=checkbox]:checked');
    for (let i = 0; i < checkedBoxes.length; i++) {
      (checkedBoxes[i] as unknown as HTMLInputElement).checked = false;
    }
  }

}


