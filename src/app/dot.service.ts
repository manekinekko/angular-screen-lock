import Konva from "konva";
import { PatternService } from "./pattern.service";

export interface DotOptions {
  pattern: PatternService;
  innerLayer: Konva.Layer;
  listenerLayer: Konva.Layer;
  x: number;
  y: number;
}

/*
 * The Dot class.
 * This is the base class for all the circles that are drawn in the container.
 * There are three kinds of dots:
 * - The inner dots, those are the gray ones that are initially drawn,
 * - The outer dots, those are the user's ones.
 * - The listener dots, those are the invisible ones that listen for user's event
 */
export class DotService extends Konva.Circle {
  // The x and y location of this dot.
  private dotPosition: {
    x: number;
    y: number;
  };

  // The inner dots layer and the listener layer.
  private dotInnerLayer: Konva.Layer;
  private listenerLayer: Konva.Layer;

  private pattern: PatternService;
  // The inner dots default values.
  private innerCircleRadius = 8;
  private innerCircleFill = "rgba(255,255,255,1)";
  private innerCircleStroke = "rgba(255,255,255,1)";

  // The stroke width value of all dots.
  private dotStrokeWidth = 1;

  private outerCircleConfig: Konva.CircleConfig;
  private listenerCircle: Konva.Circle;
  private innerCircle: Konva.Circle;

  constructor(options: DotOptions) {
    super();

    this.dotPosition = {
      x: options.x,
      y: options.y,
    };

    this.pattern = options.pattern;

    this.dotInnerLayer = options.innerLayer;
    this.listenerLayer = options.listenerLayer;

    // The user's dots default values.
    this.outerCircleConfig = {
      radius: 20,
      fill: "rgba(255,255,255,0)",
      stroke: "rgba(255,255,255,1)",
      strokeWidth: this.dotStrokeWidth,
    };

    // The inner dots reference.
    this.innerCircle = new Konva.Circle({
      x: this.dotPosition.x,
      y: this.dotPosition.y,
      radius: this.innerCircleRadius,
      fill: this.innerCircleFill,
      stroke: this.innerCircleStroke,
      strokeWidth: this.dotStrokeWidth,
    });

    this.listenerCircle = new Konva.Circle({
      x: this.dotPosition.x,
      y: this.dotPosition.y,
      radius: this.outerCircleConfig.radius + 30,
      fill: "transparent",
      listening: true,
    });

    this.listenerCircle.on("mousedown touchstart", this.mouseDown.bind(this));
    this.listenerCircle.on("mousemove touchmove", this.showUserDot.bind(this));
    this.listenerCircle.on("mouseout", this.mouseOut.bind(this));
    this.listenerCircle.on("mouseup touchend", this.mouseUp.bind(this));
    this.dotInnerLayer.add(this.innerCircle);
    this.listenerLayer.add(this.listenerCircle);
    this.dotInnerLayer.draw();
    this.listenerLayer.draw();
  }

  private mouseDown() {}
  private mouseOut() {}
  private mouseUp() {
    if (this.pattern.isRecording) {
      return;
    }
  }

  showUserDot() {
    // hide the inner circle
    this.innerCircle.strokeWidth(2);
    this.dotInnerLayer.draw();

    // add an outer circle if needed
    const outerCircle = new Konva.Circle({
      x: this.innerCircle.x(),
      y: this.innerCircle.y(),
      radius: 0,
      fill: this.outerCircleConfig.fill,
      stroke: this.outerCircleConfig.stroke,
      strokeWidth: this.outerCircleConfig.strokeWidth,
    });
    this.pattern.addDot(outerCircle, this.outerCircleConfig);
  }

  clear() {
    this.innerCircle.fill(this.innerCircleFill);
    this.innerCircle.radius(this.innerCircleRadius);
    this.dotInnerLayer.draw();
  }
}
