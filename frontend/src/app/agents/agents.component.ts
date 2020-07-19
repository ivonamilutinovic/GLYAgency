import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse  } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';
import { UserService } from "../services/user.service";

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.css']
})
export class AgentsComponent implements OnInit {

    agents = [];
    array: any;
    indicator: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit() {

    this.userService.getAdmins()
      .subscribe(res => {
        for(let key in res) {
          this.agents.push(res[key]);
        }
          if(this.agents.length===0){
            console.log('NEMA REGISTROVANIH AGENATA');
          }
          else if(this.agents.length%2){
              this.array = Array.from(new Array((this.agents.length -1)/2),(val,index)=>index);
              this.indicator=true; 
          }
            else{
              this.array = Array.from(new Array(this.agents.length/2),(val,index)=>index);
              this.indicator=false;
            }
      },
      err => {
        console.log(err);
      });

}

}
