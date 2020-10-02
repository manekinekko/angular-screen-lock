import { Component, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ScreenLockComponent } from "./screen-lock/screen-lock.component";

@Component({
  selector: "app-root",
  template: `
    <div>
      <h1>Confirm your pattern</h1>
      <h3>Enter pattern to unlock</h3>

      <mat-icon class="lock-status" *ngIf="!accessGranted">lock</mat-icon>
      <mat-icon class="lock-status" *ngIf="accessGranted">lock_open</mat-icon>

      <app-screen-lock
        #lock
        [pattern]=""
        [width]="400"
        [height]="500"
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

      h1,
      h3 {
        color: black;
        font-size: 3em;
        margin: 40px 0 0;
        padding: 0;
        font-weight: 100;
      }

      h3 {
        font-size: 2em;
        margin: 30px 0 0;
      }

      .lock-status {
        font-size: 4em;
        width: 58px;
        height: 60px;
        margin: 20px 0 0 0;
      }
    `,
  ],
})
export class AppComponent {
  @ViewChild(ScreenLockComponent) lockRef: ScreenLockComponent;
  isPatternIsRecording = false;
  showHint = true;
  accessGranted = false;

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
    this.accessGranted = true;
    this.lockRef.clear();
  }
  
  onFailure() {
    this.accessGranted = false;
    this.openSnackBar("🛑 Access Denied!");
    this.lockRef.clear();
  }
}
