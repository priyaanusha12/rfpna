import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService } from 'src/app/service/chat.service';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FileuploadService } from 'src/app/service/fileupload.service';




@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  @ViewChild('length')
  length!: ElementRef;
  @ViewChild('temp')
  temp!: ElementRef;
  @ViewChild('topK')
  topK!: ElementRef;
  @ViewChild('topP')
  topP!: ElementRef;
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  @ViewChild('uploadModal', { static: false }) uploadModal!: ElementRef; // Note the use of '!'


  messages: any[] = [{ model: 'RFP Model', user: "receive", text: 'Hi, Good to see you!' }];
  newMessage: any = '';
  msgSent: any;
  spinner: boolean = false
  modelSelected = 'RFP Model';
  apiUrl: any = `https://rfp-na-usecase-1487217326.us-central1.run.app/api/get_response`;
  documentUrl: any;
  navbarOpen = false;
  mySelectV: any = ''
  lengthV: any = '1024';
  tempV: any = '0.2';
  topKV: any = '40';
  topPV: any = '0.4'
  files: File[] = [];
  snackbarMessage: string = '';
  snackbarVisible: boolean = false;
  snackbarClass: string = '';
  successfulUploads: string[] = []; // Array to store successfully uploaded file names
  failedUploads: string[] = []; // Array to store failed upload file names
  selectedFile: File | null = null; // Change to handle a single file

  private uploadUrl = 'https://upload-docs-1487217326.us-central1.run.app/upload';
  constructor(private router: Router, private chatService: ChatService, private sanitizer: DomSanitizer, private fileUploadService: FileuploadService, private http: HttpClient) { }

  ngOnInit(): void {
  }

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  logout() {
    localStorage.removeItem('userData')
    this.router.navigate(['login'])
  }

  onSelectionChange(value: any) {
    this.documentUrl = ''
    this.messages = []
    this.modelSelected = value;
    // if (this.modelSelected == 'Search Model') {
    //   //private
    //   this.apiUrl = `https://pipeline-demonstrator-service-6qbt2nlpka-uc.a.run.app/api/get_search_response`;
    //   this.messages.push({ model: this.modelSelected, user: "receive", text: 'Hi, Good to see you!' });
    // }
    // else
    if (this.modelSelected == 'RFP Model') {
      //public
      this.apiUrl = `https://rfp-na-usecase-1487217326.us-central1.run.app/api/get_response`

      this.messages.push({ model: this.modelSelected, user: "receive", text: 'Hi, Good to see you!' });
    }
  }

  getMessage() {
    this.spinner = true;
    const body = {
      query: this.msgSent,
      temperature: this.tempV,
      top_k: this.topKV,
      top_p: this.topPV,
      max_output_tokens: this.lengthV
    }
    this.chatService.postRequest(this.apiUrl, body).subscribe(data => {
      let res = data
      this.spinner = false;

      if (res) {
        let processedText = this.processResponseText(res.Response);
        console.log(processedText)
        this.scrollToBottom()
        this.msgSent = '';
        if (this.modelSelected == 'Search Model') {
          this.messages.push({ model: this.modelSelected, user: "receive", text: res });
        }
        else {
          this.messages.push({ model: this.modelSelected, user: "receive", text: processedText });
        }
      }
    }, err => {
      this.spinner = false;
      console.log(err)
      this.messages.push({ model: this.modelSelected, user: "receive", text: err });
    });
  }
  //text: res.Response



  processResponseText(text: string): SafeHtml {
    let result = ''; // To hold the final output
    let currentLine = ''; // To build the current line
    let isBulletPoint = false; // Flag to indicate if we're in a bullet point
    let isNumberedPoint = false; // Flag to indicate if we're in a numbered point
    let hasBulletPoints = false; // Flag to indicate if there are any bullet points
    let dashCount = 0; // Count of dash-prefixed items

    // Check for specific API responses indicating no answer
    if (text.includes("cannot determine the answer")) {
      return this.sanitizer.bypassSecurityTrustHtml("<div>we cannot determine the answer.</div>");
    }
    if (text.includes("I do not know that answer")) {
      return this.sanitizer.bypassSecurityTrustHtml("<div>we cannot determine the answer.</div>");
    }

    // Iterate through each character in the text
    for (let i = 0; i < text.length; i++) {
      const char = text[i]; // Current character

      // Check for sentences wrapped in **
      if (char === '*' && text[i + 1] === '*') {
        const endIndex = text.indexOf('**', i + 2);
        if (endIndex !== -1) {
          const boldText = text.slice(i + 2, endIndex).trim();
          result += `<strong>${boldText}</strong><br><br>`; // Add bold text with line break
          i = endIndex + 1; // Move index past the ending **
          continue; // Skip the rest of the loop
        }
      }
      // Handle dash-prefixed points
      if (char === '-' && text[i + 1] === ' ') {
        dashCount++; // Increment the dash count
        if (currentLine.trim()) {
          // If there is any existing text, add it to the result first
          result += `<div style="margin-left: 30px;"><span style="font-size: 1.5em;">•</span> ${currentLine.trim()}</div><br>`;
          currentLine = ''; // Reset for the new bullet point
        }
        i += 1; // Skip over the dash and the space
        continue; // Continue to the next character
      }

      // Check for the start of a bullet point
      if (!isBulletPoint && char === '*' && text[i + 1] === ' ') {
        isBulletPoint = true; // Start a new bullet point
        hasBulletPoints = true; // Set the flag to indicate there are bullet points
        i++; // Skip the space after '*'
      } else if (!isNumberedPoint && /^\d+\.\s/.test(text.slice(i))) {
        const match = text.slice(i).match(/^(\d+\.\s)/);
        if (match) {
          isNumberedPoint = true; // Start a new numbered point
          i += match[0].length - 1; // Move index past the number and space
        }
      } else if (isBulletPoint) {
        currentLine += char; // Continue building the current line

        // Check if the current character is a full stop
        if (char === '.') {
          result += `<div style="margin-left: 30px;"><span style="font-size: 1.5em;">•</span> ${currentLine.trim()}</div><br>`;
          currentLine = ''; // Reset for the next bullet point
          isBulletPoint = false; // Reset the bullet point flag
        }
      } else if (isNumberedPoint) {
        currentLine += char; // Continue building the current line

        // Check if the current character is a full stop
        if (char === '.') {
          result += `<div style="margin-left: 30px;">${currentLine.trim()}</div><br>`;
          currentLine = ''; // Reset for the next numbered point
          isNumberedPoint = false; // Reset the numbered point flag
        }
      } else if (char === ':' && currentLine.trim()) {
        // Add the current line followed by a line break for the colon
        result += `<div>${currentLine.trim()}</div><br>`;
        currentLine = ''; // Reset for the next line
        result += `<br>`; // Add an additional line break for better spacing
      } else if (char === '.' || char === '!' || char === '?') {
        currentLine += char; // Add punctuation to the current line
        if (hasBulletPoints && currentLine.trim()) {
          result += `<div style="margin-left: 30px;"><span style="font-size: 1.5em;">•</span> ${currentLine.trim()}</div><br>`;
        } else if (currentLine.trim()) {
          result += `<div>${currentLine.trim()}</div><br>`; // Just add the text without a bullet
        }
        currentLine = ''; // Reset for the next paragraph

        // Add a new line after a complete sentence
        result += `<br>`; // This will add a blank line after every complete sentence
      } else if (char !== '*') {
        // For regular text, accumulate it into currentLine
        currentLine += char; // Build the current line without asterisks
      }
    }

    // If there is any remaining text in currentLine (in case the last line doesn't end with a period)
    if (currentLine.trim()) {
      // Always add a left margin for alignment
      result += `<div style="margin-left: 30px;">`;

      if (hasBulletPoints || !hasBulletPoints) {
        // Add bullet points for the current line
        result += `<span style="font-size: 1.5em;">•</span> ${currentLine.trim()}`;
      } else {
        // Just add the text without a bullet
        result += `${currentLine.trim()}`;
      }

      result += `</div><br>`; // Close the div and add a line break
    }

    // Sanitize and return the result
    return this.sanitizer.bypassSecurityTrustHtml(result.trim());
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

  openFile(value: any) {
    this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  openUploadDialog() {
    this.router.navigate(['/upload']);
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.showSnackbar('Please select a file to upload.', 'alert-warning');
      return;
    }


    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

  

    this.fileUploadService.uploadMultipleFiles(formData)
      .toPromise()
      .then((response: any) => {


        this.successfulUploads = [];
        this.failedUploads = [];

        // Check if response.body.message exists
        if (response.body && response.body.message) {
          const fileName = this.selectedFile?.name || 'unknown file'; // Get file name from selectedFile
          this.successfulUploads.push(fileName);
          this.showSnackbar('File uploaded successfully: ' + fileName, 'alert-success');
          this.selectedFile = null; // Clear selected file after successful upload
        } else {
          console.error('Unexpected response structure:', response);
          this.showSnackbar('Unexpected response structure.', 'alert-danger');
        }
      })
      .catch((error: any) => {
        console.error('Upload failed in promise:', error);

        this.failedUploads = [];
        if (error && error.response && error.response.files) {
          const failedFiles = error.response.files.map((file: { name: string }) => file.name);
          this.failedUploads.push(...failedFiles);
          failedFiles.forEach((fileName: string) => {
            this.showSnackbar('Upload failed for: ' + fileName, 'alert-danger');
          });
        } else {
          const fileName = this.selectedFile ? this.selectedFile.name : 'unknown file';
          this.failedUploads.push(fileName);
          this.showSnackbar('Upload failed for: ' + fileName, 'alert-danger');
        }

        this.showSnackbar('Upload failed.', 'alert-danger');
      });
  }

  // Method to handle file input change
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0]; // Store the single selected file
    }
  }

  // Method to remove the selected file
  removeFile(): void {
    this.selectedFile = null; // Clear the selected file
  }

  // Reset method

  // Method to update files (e.g., when a file is added/removed)
  updateSelectedFiles(newFiles: File[]): void {
    this.files = newFiles; // Update the files array to reflect current selection
  }



  // Create a summary for the snackbar
  createUploadSummary(): string {
    let summary = '';
    if (this.successfulUploads.length > 0) {
      summary += 'Successfully uploaded:\n' + this.successfulUploads.join(', ') + '\n';
    }

    if (this.failedUploads.length > 0) {

      summary += 'Failed to upload:\n' + this.failedUploads.join(', ');
    }
    return summary;
  }


  showSnackbar(message: string, type: string) {
    this.snackbarMessage = message;
    this.snackbarClass = type;
    this.snackbarVisible = true;
  }

  hideSnackbar() {
    this.snackbarVisible = false;
  }

  reset(): void {
    this.files = [];
    this.successfulUploads = []; // Reset successful uploads
    this.failedUploads = []; // Reset failed uploads
    this.hideSnackbar();

  }




}

