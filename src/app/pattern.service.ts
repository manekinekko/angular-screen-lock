import { Injectable } from "@angular/core";
import Konva from "konva";
import { ReplaySubject } from "rxjs";
import { DotOptions, DotService } from "./dot.service";

export interface PatternOptions {
  stage: Konva.Stage;
  patternLayer: Konva.Layer;
  lineLayer: Konva.Layer;
  hintLayer: Konva.Layer;
  listenerLayer: Konva.Layer;
  dotsInnerLayer: Konva.Layer;
}

@Injectable({
  providedIn: "root",
})
export class PatternService {
  isRecording: boolean;
  private toBeClearedOnNextUse: boolean;
  private hintLayer: Konva.Layer;
  private patternLayer: Konva.Layer;
  private lineLayer: Konva.Layer;
  private stage: Konva.Stage;
  private listenerLayer: Konva.Layer;
  private dotsInnerLayer: Konva.Layer;

  // The user's input dots.
  // NOTE: these dots are Circles objects!
  private userDots: Konva.Circle[] = [];

  // The user's saved pattern's dots.
  // NOTE: these dots are JavaScript objects!
  savedPattern: Konva.Circle[] = [];

  private dots: DotService[] = [];

  private mousePosition: {
    x0: number;
    y0: number;
    x: number;
    y: number;
  };

  validate$: ReplaySubject<boolean>;

  constructor() {
    this.mousePosition = {
      x0: 0,
      y0: 0,
      x: 0,
      y: 0,
    };
    this.dots = [];

    this.validate$ = new ReplaySubject<boolean>(1);
  }

  setOptions(options: PatternOptions) {
    this.stage = options.stage;
    this.patternLayer = options.patternLayer;
    this.hintLayer = options.hintLayer;
    this.lineLayer = options.lineLayer;
    this.listenerLayer = options.listenerLayer;
    this.dotsInnerLayer = options.dotsInnerLayer;

    this.listenerLayer.on("mouseup touchend", this.mouseUp.bind(this));

    // get the current mouse location.
    const stage = options.patternLayer.getStage();
    const mousePos = { x: stage.width() / 2, y: stage.height() / 2 };

    // the mouse start location.
    this.mousePosition.x0 = mousePos.x;
    this.mousePosition.y0 = mousePos.y;

    // the mouse end location.
    this.mousePosition.x = this.mousePosition.x0;
    this.mousePosition.y = this.mousePosition.y0;
  }

  mouseUp() {
    if (!this.isRecording) {
      this.validate$.next(this.isValid());
    }
  }

  setRecording(state: boolean) {
    this.isRecording = state;
  }

  setToBeClearedOnNextUse(state: boolean) {
    this.toBeClearedOnNextUse = state;
  }

  // This method initializes the saved pattern.
  parseAndSaveUserPattern(pattern: string) {
    const patternArray = pattern.split(/[#\|_,; -]+/);
    let dotPosition = 0;
    for (let i = 0; i < patternArray.length; i += 1) {
      dotPosition = +patternArray[i] - 1;
      if (dotPosition >= 0 && this.dots[dotPosition]) {
        const dot = this.dots[dotPosition];
        if (this.shouldDrawDot(dot)) {
          this.savePatternDot(dot);
        }
      }
    }
    this.buildHint();
  }

  drawContainer() {
    const w = this.stage.width();
    const h = this.stage.height();
    const mW = Math.floor(w / 2);
    const mH = Math.floor(h / 2);
    const offsetW = Math.floor(w / 3);
    const offsetH = Math.floor(h / 3);
    const points = [
      { x: mW - offsetW, y: mH - offsetH },
      { x: mW, y: mH - offsetH },
      { x: mW + offsetW, y: mH - offsetH },

      { x: mW - offsetW, y: mH },
      { x: mW, y: mH },
      { x: mW + offsetW, y: mH },

      { x: mW - offsetW, y: mH + offsetH },
      { x: mW, y: mH + offsetH },
      { x: mW + offsetW, y: mH + offsetH },
    ];
    const options: DotOptions = {
      pattern: this,
      innerLayer: this.dotsInnerLayer,
      listenerLayer: this.listenerLayer,
      x: 0,
      y: 0,
    };

    for (let i = 0; i < points.length; i += 1) {
      options.x = points[i].x;
      options.y = points[i].y;
      this.dots.push(new DotService(options));
    }
  }

  // Show the hint layer.
  showHint() {
    this.hintLayer.show();
    this.hintLayer.draw();
  }

  // Hide the hint layer.
  hideHint() {
    this.hintLayer.hide();
    this.hintLayer.draw();
  }

  clearSavedPattern() {
    this.savedPattern = [];
    this.hintLayer.removeChildren();
    this.hintLayer.clear();
    this.hintLayer.draw();
  }

  // Check if the user input matches the saved pattern.
  isValid() {
    if (this.savedPattern.length !== this.userDots.length) {
      return false;
    }
    for (let i = 0; i < this.savedPattern.length; i++) {
      const savedDot = this.savedPattern[i];
      const userDot = this.userDots[i];
      if (savedDot.x() !== userDot.x() || savedDot.y() !== userDot.y()) {
        return false;
      }
    }
    return true;
  }

  // Clear the user's input and the current layers.
  clear() {
    this.clearUserDots();
    this.clearLayers();

    for (let i = 0; i < this.dots.length; i += 1) {
      this.dots[i].clear();
    }
  }

  // Clear the current layers.
  clearLayers() {
    const dots = this.patternLayer.getChildren();
    const l = dots.length;
    for (let i = 0; i < l; i += 1) {
      const node = dots[i];
      new Konva.Tween({
        node,
        duration: 0.1,
        radius: 0,
        onFinish: () => {
          if (l - 1 === i) {
            this.patternLayer.clear();
            this.patternLayer.removeChildren();
            this.patternLayer.draw();
          }
        },
      }).play();
    }

    this.lineLayer.clear();
    this.lineLayer.removeChildren();
    this.lineLayer.draw();
  }

  clearUserDots() {
    this.userDots = [];
  }

  addDot(dot: Konva.Circle, config: Konva.CircleConfig) {
    if (this.toBeClearedOnNextUse) {
      this.clear();
      this.toBeClearedOnNextUse = false;
    }

    if (this.shouldDrawDot(dot)) {
      if (this.isRecording) {
        this.savePatternDot(dot);
      } else {
        if (this.shouldDrawDot(dot)) {
          this.addUserDot(dot);
        }
      }

      this.patternLayer.add(dot);
      this.setTransition(dot, config);
      this.patternLayer.draw();
    }
  }

  // Should the dot be drawn. This prevent adding duplicate dots.
  shouldDrawDot(dot: Konva.Circle) {
    const dots = this.isRecording ? this.savedPattern : this.userDots;
    for (let i = 0; i < dots.length; i += 1) {
      const d = dots[i];
      if (d.x() === dot.x() && d.y() === dot.y()) {
        return false;
      }
    }
    return true;
  }

  // Add a dot to the savedPattern array (during the recording process).
  savePatternDot(dot: Konva.Circle) {
    this.savedPattern.push(
      new Konva.Circle({
        radius: 1,
        x: dot.x(),
        y: dot.y(),
      })
    );
  }

  buildHint() {
    if (this.savedPattern.length > 0) {
      this.lineLayer.removeChildren();
      const line = this.newLine(this.savedPattern, "rgba(255,255,255,0.1)");
      line.opacity(0.1);
      this.hintLayer.add(line);
  
      this.showHint();
    }
  }

  getSavedPattern() {
    return this.convertToNum(this.savedPattern);
  }

  private convertToNum(dots: Konva.Circle[]) {
    if (!dots.length) {
      return;
    }
    const w = this.stage.width();
    const h = this.stage.height();
    const mW = Math.floor(w / 2);
    const mH = Math.floor(h / 2);
    const offsetW = Math.floor(w / 3);
    const offsetH = Math.floor(h / 3);
    const points = [
      [mW - offsetW, mH - offsetH].join("|"),
      [mW, mH - offsetH].join("|"),
      [mW + offsetW, mH - offsetH].join("|"),

      [mW - offsetW, mH].join("|"),
      [mW, mH].join("|"),
      [mW + offsetW, mH].join("|"),

      [mW - offsetW, mH + offsetH].join("|"),
      [mW, mH + offsetH].join("|"),
      [mW + offsetW, mH + offsetH].join("|"),
    ];
    const result: number[] = [];
    for (let i = 0; i < dots.length; i += 1) {
      const p = [dots[i].x(), dots[i].y()].join("|");
      if (points.indexOf(p) > -1) {
        result.push(points.indexOf(p) + 1);
      }
    }
    return result;
  }

  // Save a new dot to the user's inputs array.
  private addUserDot(dot: Konva.Circle) {
    this.userDots.push(dot);
  }

  // Set a transition animation (on dots).
  private setTransition(dot: Konva.Circle, options: Konva.CircleConfig) {
    new Konva.Tween({
      node: dot,
      radius: options.radius,
      duration: 0.1,
      onFinish: () => this.drawLine(),
    }).play();
  }

  // Draw a line that connect all drawn dots.
  private drawLine() {
    const dots = this.isRecording ? this.savedPattern : this.userDots;
    if (dots.length >= 2) {
      const line = this.newLine(dots);
      this.lineLayer.removeChildren();
      this.lineLayer.add(line);
      this.lineLayer.draw();
    }
  }

  // Build and return a new line.
  private newLine(dots: Konva.Circle[], strokeStyle = "rgba(255,255,255,0.5)") {
    return new Konva.Shape({
      sceneFunc: function () {
        const ctx: any = this.getContext();
        const dot1 = dots[0];
        ctx.beginPath();
        ctx.moveTo(dot1.x(), dot1.y());
        for (let i = 1; i < dots.length; i += 1) {
          const dot: Konva.Circle = dots[i];
          ctx.lineTo(dot.x(), dot.y());
        }
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    });
  }
}
