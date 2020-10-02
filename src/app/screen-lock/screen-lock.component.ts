import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import Konva from "konva";
import { PatternService } from "../pattern.service";

@Component({
  selector: "app-screen-lock",
  template: `<div #lockScreen></div>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ScreenLockComponent implements OnInit {
  @Input() width = 400;
  @Input() height = 400;
  @Input() pattern = "";

  @Output() onSuccess: EventEmitter<void>;
  @Output() onFailure: EventEmitter<void>;

  @ViewChild("lockScreen", {
    static: true,
  })
  lockScreen: ElementRef<HTMLDivElement>;

  private stage: Konva.Stage;
  private dotsInnerLayer: Konva.Layer;
  private dotsOuterLayer: Konva.Layer;
  private lineLayer: Konva.Layer;
  private listenerLayer: Konva.Layer;
  private hintLayer: Konva.Layer;

  constructor(private patternService: PatternService) {
    this.onSuccess = new EventEmitter();
    this.onFailure = new EventEmitter();

    this.patternService.validate$.subscribe((isValid) => {
      if (isValid) {
        this.validatePattern();
        this.onSuccess.emit();
      } else {
        this.invalidatePattern();
        this.onFailure.emit();
      }
    });
  }

  ngOnInit(): void {
    // Define a Konva object with the given config options.
    this.stage = new Konva.Stage({
      container: this.lockScreen.nativeElement,
      width: this.width,
      height: this.height,
    });

    // Define all needed Konva Layers.
    this.dotsInnerLayer = new Konva.Layer();
    this.dotsOuterLayer = new Konva.Layer();
    this.lineLayer = new Konva.Layer();
    this.listenerLayer = new Konva.Layer();
    this.hintLayer = new Konva.Layer();
    this.stage.add(this.dotsInnerLayer);
    this.stage.add(this.dotsOuterLayer);
    this.stage.add(this.lineLayer);
    this.stage.add(this.hintLayer);
    this.stage.add(this.listenerLayer);

    this.patternService.setOptions({
      stage: this.stage,
      patternLayer: this.dotsOuterLayer,
      lineLayer: this.lineLayer,
      hintLayer: this.hintLayer,
      dotsInnerLayer: this.dotsInnerLayer,
      listenerLayer: this.listenerLayer,
    });

    if (this.pattern) {
      this.patternService.parseAndSaveUserPattern(this.pattern);
    }
    this.patternService.drawContainer();
  }

  resultHint() {
    return this.patternService.getSavedPattern();
  }

  setPattern(pattern: string) {
    this.reset();
    this.patternService.parseAndSaveUserPattern(pattern);
  }

  reset() {
    this.clear();
    this.patternService.clearSavedPattern();
  }

  clear() {
    this.patternService.clear();
  }

  startRecordPattern() {
    this.clear();
    this.patternService.clearSavedPattern();
    this.patternService.setRecording(true);
    this.patternService.setToBeClearedOnNextUse(false);
  }

  stopRecordPattern() {
    this.clear();
    this.patternService.setRecording(false);
    this.patternService.buildHint();
  }

  private validatePattern() {}
  private invalidatePattern() {
    const dots = this.dotsOuterLayer.getChildren((node) => node.getClassName() === "Circle").toArray();
    const line = this.lineLayer.getChildren((node) => node.getClassName() === "Line").toArray();

    if (line.length > 0) {
      line[0].setAttr("fill", "rgba(255,0,0,0.5)");
      for (let i = 0; i < dots.length; i += 1) {
        const dot = dots[i];
        dot.setAttr("stroke", "rgba(255,0,0,0.8)");
      }
      this.dotsOuterLayer.draw();
      this.lineLayer.draw();
      this.patternService.setToBeClearedOnNextUse(true);
    }
  }
}
