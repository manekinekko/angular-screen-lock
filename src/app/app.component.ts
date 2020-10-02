import { Component, ViewChild } from "@angular/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScreenLockComponent } from "./screen-lock/screen-lock.component";

@Component({
  selector: "app-root",
  template: `
    <div class="lock-screen-container">
      <h1>Angular Screen Lock</h1>

      <app-screen-lock
        #lock
        [pattern]=""
        [width]="400"
        [height]="600"
        (onSuccess)="onSuccess()"
        (onFailure)="onFailure()"
      ></app-screen-lock>

      <div class="buttons">
        <button color="warn" mat-fab (click)="savePatternButton()">
          <mat-icon *ngIf="isPatternIsRecording">stop_circle</mat-icon>
          <mat-icon *ngIf="!isPatternIsRecording">fiber_manual_record</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class AppComponent {
  @ViewChild(ScreenLockComponent) lockRef: ScreenLockComponent;
  isPatternIsRecording = false;
  showHint = true;

  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(message: string) {
    this.snackBar.open(message, "", {
      duration: 2000,
    });
  }


  savePatternButton() {
    if (this.isPatternIsRecording === true) {
      this.lockRef.stopRecordPattern();
      this.isPatternIsRecording = false;
    } else {
      this.isPatternIsRecording = true;
      this.lockRef.startRecordPattern();
    }
  }

  resetButton() {
    this.lockRef.reset();
  }

  onSuccess() {
    this.openSnackBar("🎉 Access Granted");
    this.lockRef.clear();
  }
  
  onFailure() {
    this.openSnackBar("🛑 Access Denied!");
    this.lockRef.clear();
  }
}
