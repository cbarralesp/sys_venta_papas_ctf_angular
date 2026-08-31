import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';

import { CocinaStore } from '../../application/cocina.store';

@Component({
  selector: 'app-pantalla-cocina',
  imports: [],
  providers: [CocinaStore],
  templateUrl: './pantalla-page.html',
  styleUrl: './pantalla-page.scss',
})
export class PantallaCocina {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  readonly cocinaStore = inject(CocinaStore);

  readonly enPreparacion = this.cocinaStore.enPreparacion;
  readonly listos = this.cocinaStore.listos;
  readonly pantallaCompleta = signal(false);

  readonly ultimoListoNumero = computed(() => {
    const items = this.listos();
    return items.length > 0 ? items[items.length - 1].numero : null;
  });

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      this.elementRef.nativeElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.pantallaCompleta.set(!!document.fullscreenElement);
  }
}
