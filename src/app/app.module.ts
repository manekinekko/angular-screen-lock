import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { ScreenLockComponent } from "./screen-lock/screen-lock.component";
import { MatButtonModule } from "@angular/material/button";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";

@NgModule({
  declarations: [AppComponent, ScreenLockComponent],
  imports: [BrowserModule, MatButtonModule, MatSnackBarModule, BrowserAnimationsModule, MatIconModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
