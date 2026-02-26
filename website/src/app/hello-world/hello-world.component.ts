import { Component } from '@angular/core';

@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss']
})
export class HelloWorldComponent {
  headline = 'Hello, World!';
  message = 'Welcome to a cleaner, friendlier starting point.';
}
