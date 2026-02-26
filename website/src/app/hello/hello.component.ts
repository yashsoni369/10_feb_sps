import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent {
  title = 'Hello, world!';
  subtitle = 'Welcome to your refreshed starting point.';
  highlights = [
    'Fast setup and friendly defaults',
    'Clean layout with clear navigation',
    'Ready to extend with real features'
  ];
}
