// libraries
import React, {
  CSSProperties,
  MouseEvent,
  ReactNode,
  useEffect,
  useState
} from "react";
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

export default function Draggable(props: Props) {
  const {
    children,
    cursor,
    portal,
    onDragStart = () => {},
    onDrag = () => {},
    onDragStop = () => {}
  } = props;

  const [origin, setOrigin] = useState<Coord | null>(null);

  useEffect(() => {
    if (!props.portal && process.env.NODE_ENV === "development")
      console.warn("Draggable portal is undefined.");
  });

  const startDrag = (event: MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event,
      origin = {
        x: clientX,
        y: clientY
      };

    onDragStart(event, {
      origin,
      current: origin,
      distance: { x: 0, y: 0 }
    });

    setOrigin(origin);
  };

  const drag = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event,
      start = origin || { x: 0, y: 0 };
    const current = { x: clientX, y: clientY };

    onDrag(event, {
      current,
      origin: start,
      distance: {
        x: current.x - start.x,
        y: current.y - start.y
      }
    });
  };

  const stopDrag = (event: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event,
      start = origin || { x: 0, y: 0 };
    const current = { x: clientX, y: clientY };

    onDragStop(event, {
      current,
      origin: start,
      distance: {
        x: current.x - start.x,
        y: current.y - start.y
      }
    });

    setOrigin(null);
  };

  return (
    <>
      {children({ onMouseDown: startDrag })}
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
            onMouseMove={drag}
            onMouseUp={stopDrag}
          />,
          portal
        )}
    </>
  );
}
