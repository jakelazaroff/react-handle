// libraries
import React, { Component, CSSProperties, MouseEvent, ReactNode } from "react";
import { createPortal } from "react-dom";

export interface Coord {
  x: number;
  y: number;
}

export interface DragInfo {
  origin: Coord;
  current: Coord;
  distance: Coord;
}

export interface DraggableProps {
  onMouseDown(event: MouseEvent<HTMLElement>): void;
}

export interface Props {
  children(props: DraggableProps): ReactNode;
  portal: Element;
  cursor?: CSSProperties["cursor"];
  onDragStart?(event: MouseEvent<HTMLElement>, info: DragInfo): void;
  onDrag?(event: MouseEvent<HTMLDivElement>, info: DragInfo): void;
  onDragStop?(event: MouseEvent<HTMLDivElement>, info: DragInfo): void;
}

interface State {
  origin?: {
    x: number;
    y: number;
  };
}

export default class Draggable extends Component<Props, State> {
  state: State = {};

  componentDidMount() {
    this.checkPortal();
  }

  componentDidUpdate() {
    this.checkPortal();
  }

  private checkPortal = () => {
    if (!this.props.portal && process.env.NODE_ENV === "development")
      console.warn("Draggable portal is undefined.");
  };

  private startDrag = (event: MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event,
      origin = {
        x: clientX,
        y: clientY
      };

    if (this.props.onDragStart)
      this.props.onDragStart(event, {
        origin,
        current: origin,
        distance: { x: 0, y: 0 }
      });

    this.setState(() => ({ origin }));
  };

  private drag = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event,
      { origin = { x: 0, y: 0 } } = this.state;
    const current = { x: clientX, y: clientY };

    if (this.props.onDrag)
      this.props.onDrag(event, {
        origin,
        current,
        distance: {
          x: current.x - origin.x,
          y: current.y - origin.y
        }
      });
  };

  private stopDrag = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event,
      { origin = { x: 0, y: 0 } } = this.state;
    const current = { x: clientX, y: clientY };

    if (this.props.onDragStop)
      this.props.onDragStop(event, {
        origin,
        current,
        distance: {
          x: current.x - origin.x,
          y: current.y - origin.y
        }
      });

    this.setState(() => ({ origin: undefined }));
  };

  render() {
    const { children, portal, cursor } = this.props;
    const { origin } = this.state;

    return (
      <>
        {children({ onMouseDown: this.startDrag })}
        {!!origin &&
          portal &&
          createPortal(
            <div
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                zIndex: 1000000,
                pointerEvents: "all",
                cursor
              }}
              onMouseMove={this.drag}
              onMouseUp={this.stopDrag}
            />,
            portal
          )}
      </>
    );
  }
}
