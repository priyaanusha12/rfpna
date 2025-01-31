import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('length')
  length!: ElementRef;
  @ViewChild('temp')
  temp!: ElementRef;
  @ViewChild('topK')
  topK!: ElementRef;
  @ViewChild('topP')
  topP!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;


  messages: any[] = [{ model: 'Google - RAG PALM2 llm', user: "receive", text: 'Hi, Good to see you!' }];
  newMessage: any = '';
  msgSent: any;
  spinner: boolean = false
  modelSelected = 'Google - RAG PALM2 llm';
  apiUrl:any = `https://customllm-api-x6ksvay2la-uc.a.run.app/api/get_response`;


  constructor(private router: Router, private chatService: ChatService) { }

  ngOnInit(): void {
  }

  logout() {
    localStorage.removeItem('userData')
    this.router.navigate(['login'])
  }

  onSelectionChange(value: any) {
    this.messages = []
    this.modelSelected = value;
    if (this.modelSelected == 'Google - RAG PALM2 llm') {
      //private
      this.apiUrl = `https://customllm-api-x6ksvay2la-uc.a.run.app/api/get_response`;
      this.messages.push({ model: this.modelSelected, user: "receive", text: 'Hi, Good to see you!' });
    }
    else if (this.modelSelected == 'Google - Public PALM2 llm') {
      //public
      this.apiUrl = `https://customllm-api-x6ksvay2la-uc.a.run.app/api/public/get_response`
      this.messages.push({ model: this.modelSelected, user: "receive", text: 'Hi, Good to see you!' });
    }
  }

  getMessage() {
    this.spinner = true;
    const body = {
      query: this.msgSent,
      temperature: this.temp.nativeElement.value,
      top_k: this.topK.nativeElement.value,
      top_p: this.topP.nativeElement.value,
      max_output_tokens: this.length.nativeElement.value
    }
    this.chatService.postRequest(this.apiUrl, body).subscribe(data => {
      let res = data
      this.spinner = false;
      if (res) {
        this.scrollToBottom()
        this.msgSent = '';
        this.messages.push({ model: this.modelSelected, user: "receive", text: res.Response });
      }
    }, err => {
      this.spinner = false;
      console.log(err)
      this.messages.push({ model: this.modelSelected, user: "receive", text: err });
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ user: "send", text: this.newMessage })
      this.msgSent = this.newMessage;
      this.newMessage = '';
      this.scrollToBottom()
      this.getMessage();
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      setTimeout(() => {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      });
    }
  }
  
}

