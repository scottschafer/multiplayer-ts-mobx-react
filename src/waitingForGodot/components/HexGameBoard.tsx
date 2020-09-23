import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import { UtilGraphics } from '../../utils/UtilsGraphics';
import { GodotConstants } from '../GodotConstants';
import Button from 'react-bootstrap/Button';
import './HexGameBoard.scss';

export type Slot = {
  id?: string | number;
  col: number;
  row: number;
  legend?: string;
  legendClassName?: string;
  fillColor?: string;
  branches?: Array<string | number>;
}

export interface HexGameBoardProps {
  slots: Array<Slot>;
  cellRadius: number;
  movePaths?: Array<Array<number>>;

  onClickMoveTarget: (number) => void;
}

const HexGameBoard = (props: HexGameBoardProps) => {
  const { slots, cellRadius, movePaths } = props;
  const targets = movePaths.map(path => {
    return path[path.length - 1];
  });
  const cellArray: Array<{ col: Number, row: number }> = slots.map(slot => ({ col: (slot.col), row: (slot.row) }));

  const [rendered, setRendered] = useState(false);


  const getTargetStyle = (slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot) {
      return {};
    }
    const pos = UtilGraphics.getHexagonCenter(slot.col, slot.row, GodotConstants.cellRadius);
    return {
      left: (pos.x + 'px'),
      top: (pos.y + 'px'),
    };
  }

  const getLegendStyle = (slot: Slot) => {
    const pos = UtilGraphics.getHexagonCenter(slot.col, slot.row, GodotConstants.cellRadius);
    return {
      left: (pos.x + 'px'),
      top: (pos.y + 'px'),
    };
  }

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (rendered) {
      return;
    }
    setRendered(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffefa0';
    const numCols = 20;
    const numRows = 20;
    const xOffset = 5;
    const yOffset = 5;

    // draw the grid
    UtilGraphics.drawHexagonGrid(ctx, numCols, numRows, cellRadius, true, true, cellArray, 5, 5);
    ctx.strokeStyle = '#00000050';
    ctx.lineWidth = 3;
    const branchesDrawn = {};

    const drawBranches = (from: Slot) => {
      if (branchesDrawn[from.id]) {
        return;
      }
      branchesDrawn[from.id] = true;
      // if (from.id === 'GODOT') {
      //   debugger;
      // }

      if (from.branches) {
        const fromPos = UtilGraphics.getHexagonCenter(from.col, from.row, cellRadius);
        from.branches.forEach(branchId => {
          const to = slots.find(slot => (slot.id === branchId));
          if (to) {
            const toPos = UtilGraphics.getHexagonCenter(to.col, to.row, cellRadius);
            const xDelta = toPos.x - fromPos.x;
            const yDelta = toPos.y - fromPos.y;
            const len = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
            const insetVal = 10 / len; //.3; //20 / len; //.3; //len / 100;

            let fromPosX = fromPos.x + xOffset + xDelta * insetVal;
            let fromPosY = fromPos.y + yOffset + yDelta * insetVal;
            let toPosX = toPos.x + xOffset - xDelta * insetVal;
            let toPosY = toPos.y + yOffset - yDelta * insetVal;

            UtilGraphics.drawLineWithArrows(ctx, fromPosX, fromPosY, toPosX, toPosY, 5, 5);
            // if (branchId !== 0) {
            drawBranches(to);
            // }
          }
        });
      }
    };
    drawBranches(slots[0]);
  }, [setRendered]);

  return (
    <div className='HexGameBoard'>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}></canvas>
      {/* {
        slots.map(slot => <div className='slot' key={slot.id} style={getStyle(slot)}></div>)
      } */}
      {targets && targets.map(pos =>
        <Button className='btnMove glow' key={pos} style={getTargetStyle(pos)} variant="light"
          onClick={() => props.onClickMoveTarget(pos)}>Move</Button>
      )}

      {props.slots.filter(slot => (!!slot.legend)).map((slotWithLegend, i) =>
        <div key={i} className={`legend ${slotWithLegend.legendClassName || ''}`} style={getLegendStyle(slotWithLegend)}>
          {slotWithLegend.legend}</div>
      )}


    </div>
  );
}



export default observer(HexGameBoard);
