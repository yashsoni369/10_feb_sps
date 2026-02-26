import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit {

  greeting = 'Hello, World!';
  subtitle = 'Welcome to our application';
  isVisible = false;
  clickCount = 0;

  private greetings = [
    { text: 'Hello, World!', lang: 'English' },
    { text: 'नमस्ते, दुनिया!', lang: 'Hindi' },
    { text: 'Hola, Mundo!', lang: 'Spanish' },
    { text: 'Bonjour, le Monde!', lang: 'French' },
    { text: 'こんにちは世界！', lang: 'Japanese' },
    { text: 'Hallo, Welt!', lang: 'German' },
    { text: 'Ciao, Mondo!', lang: 'Italian' },
    { text: '안녕하세요, 세계!', lang: 'Korean' },
    { text: 'Olá, Mundo!', lang: 'Portuguese' },
    { text: 'Привет, мир!', lang: 'Russian' }
  ];

  currentLang = 'English';

  ngOnInit(): void {
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  }

  cycleGreeting(): void {
    this.clickCount++;
    const index = this.clickCount % this.greetings.length;
    this.greeting = this.greetings[index].text;
    this.currentLang = this.greetings[index].lang;
  }
}
