import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type">
          <div class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else if (toast.type === 'warning') { ⚠ }
            @else { ℹ }
          </div>
          <div class="toast-text">{{ toast.message }}</div>
          <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: 0.875rem;
      font-weight: 500;
      color: #FFFFFF;
      min-width: 280px;
      max-width: 420px;
      animation: slideIn 0.25s ease-out;
    }
    .toast-success { background: #00874C; }
    .toast-error { background: #FF4D4F; }
    .toast-warning { background: #D47B00; }
    .toast-info { background: #151D25; }
    .toast-icon {
      font-weight: bold;
      font-size: 1.1rem;
    }
    .toast-text {
      flex: 1;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: #FFFFFF;
      font-size: 1.25rem;
      cursor: pointer;
      opacity: 0.8;
      &:hover { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
