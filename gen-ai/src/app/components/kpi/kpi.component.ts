import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss']
})
export class KpiComponent {
  tableData: any = [];
  prompt: any;
  response: any;
  totalItems: any; 
  pageSize = 5; 
  currentPage = 1; 

  constructor(private router: Router, private chatService: ChatService) { }

  ngOnInit(): void {
    this.kpidetail()
  }

  logout() {
    localStorage.removeItem('userData')
    this.router.navigate(['login'])
  }

  kpidetail() {
    const url = `https://customllm-api-x6ksvay2la-uc.a.run.app/api/get_bigquery_data`;

    this.chatService.getRequest(url).subscribe(data => {
      if (data) {
        this.tableData = data.table_data;
        this.totalItems = this.tableData.length;
      }
    }, err => {

    })
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
  }

  openModal(value:any) {
    this.prompt = value.query;
    this.response = value.response
  }

}
