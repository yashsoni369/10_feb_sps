import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit {
  title: string = 'Hello World!';
  subtitle: string = 'Welcome to our improved application';
  currentTime: Date = new Date();

  constructor() { }

  ngOnInit(): void {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  refreshMessage(): void {
    const messages = [
      'Hello World!',
      'Namaste!',
      'Welcome!',
      'Greetings!'
    ];
    this.title = messages[Math.floor(Math.random() * messages.length)];
  }
}
