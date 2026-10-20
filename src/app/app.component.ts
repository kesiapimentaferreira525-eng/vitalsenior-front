import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'vs-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
    <router-outlet />
  `,
})
export class AppComponent {}
