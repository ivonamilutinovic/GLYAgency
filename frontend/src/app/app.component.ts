import { Component, OnInit } from '@angular/core';
import { AuthorisationService } from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'GLI agency';
  adminFlag;
  constructor(
    private authorisationService: AuthorisationService
  ) { }

  ngOnInit() {
    this.authorisationService.getAdminFlag().subscribe(adminFlag => {
      this.adminFlag = adminFlag;
    })
  }
}
