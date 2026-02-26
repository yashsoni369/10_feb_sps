import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent implements OnInit, OnDestroy {

  greetings: { text: string; language: string }[] = [
    { text: 'Hello, World!', language: 'English' },
    { text: 'Hola, Mundo!', language: 'Spanish' },
    { text: 'Bonjour, le Monde!', language: 'French' },
    { text: 'Hallo, Welt!', language: 'German' },
    { text: 'Ciao, Mondo!', language: 'Italian' },
    { text: 'Olá, Mundo!', language: 'Portuguese' },
    { text: 'こんにちは世界！', language: 'Japanese' },
    { text: '你好，世界！', language: 'Chinese' },
    { text: 'Привет, мир!', language: 'Russian' },
    { text: 'नमस्ते दुनिया!', language: 'Hindi' },
    { text: 'مرحبا بالعالم!', language: 'Arabic' },
    { text: '안녕하세요 세계!', language: 'Korean' }
  ];

  currentIndex = 0;
  displayText = '';
  currentLanguage = '';
  isTyping = false;
  showContent = false;
  particles: { id: number; left: string; delay: string; duration: string; size: string }[] = [];

  private typingInterval: any;
  private autoRotateInterval: any;

  ngOnInit(): void {
    this.generateParticles();
    setTimeout(() => {
      this.showContent = true;
      this.typeGreeting(this.greetings[0]);
    }, 300);
    this.startAutoRotate();
  }

  ngOnDestroy(): void {
    clearInterval(this.typingInterval);
    clearInterval(this.autoRotateInterval);
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 8 + 's',
      duration: (Math.random() * 6 + 6) + 's',
      size: (Math.random() * 6 + 2) + 'px'
    }));
  }

  typeGreeting(greeting: { text: string; language: string }): void {
    this.isTyping = true;
    this.displayText = '';
    this.currentLanguage = greeting.language;
    let charIndex = 0;

    clearInterval(this.typingInterval);
    this.typingInterval = setInterval(() => {
      if (charIndex < greeting.text.length) {
        this.displayText += greeting.text[charIndex];
        charIndex++;
      } else {
        clearInterval(this.typingInterval);
        this.isTyping = false;
      }
    }, 80);
  }

  nextGreeting(): void {
    this.currentIndex = (this.currentIndex + 1) % this.greetings.length;
    this.typeGreeting(this.greetings[this.currentIndex]);
    this.restartAutoRotate();
  }

  prevGreeting(): void {
    this.currentIndex = (this.currentIndex - 1 + this.greetings.length) % this.greetings.length;
    this.typeGreeting(this.greetings[this.currentIndex]);
    this.restartAutoRotate();
  }

  private startAutoRotate(): void {
    this.autoRotateInterval = setInterval(() => {
      this.nextGreeting();
    }, 5000);
  }

  private restartAutoRotate(): void {
    clearInterval(this.autoRotateInterval);
    this.startAutoRotate();
  }
}
