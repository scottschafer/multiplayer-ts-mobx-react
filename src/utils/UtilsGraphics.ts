import Row from 'react-bootstrap/Row';
export class UtilGraphics {

  static getHexagonCenter(col: number, row: number, radius: number): { x: number, y: number } {
    const result = { x: 0, y: 0 };

    result.x = ((row % 2) ? 0 : radius) + radius * 2 * col;
    result.y = radius + row * radius * 1.7321;
    return result;
  }

  static drawHexagonGrid(
    ctx: CanvasRenderingContext2D,
    numCols: number,
    numRows: number,
    radius: number,
    fill: boolean = false,
    stroke: boolean = true,
    arrayCells?: Array<{ col: Number, row: number }>,
    xOffset: number = 0,
    yOffset: number = 0) {

    let showCellMap: { [key: string]: boolean } = null;
    if (arrayCells) {
      showCellMap = {};
      arrayCells.forEach(pos => {
        showCellMap[pos.col + ',' + pos.row] = true;
      });
    }
    for (let y = 0; y < numRows; y++) {
      // let cy = xOffset + radius + y * rowHeight;
      // let cx = yOffset + (y % 2) ? radius : 0;
      for (let x = 0; x < numCols; x++) {
        if (showCellMap) {
          if (!showCellMap[x + ',' + y]) {
            continue;
          }
        }
        const pos = UtilGraphics.getHexagonCenter(x, y, radius);

        UtilGraphics.drawHexagon(ctx, pos.x + xOffset, pos.y + yOffset, radius * 1.15, fill, stroke);
        //          cx += radius * 2;
      }
    }

    // let rowHeight = radius * 1.7321;

    // for (let y = 0; y < numRows; y++) {
    //   let cy = xOffset + radius + y * rowHeight;
    //   let cx = yOffset + (y % 2) ? radius : 0;
    //   for (let x = 0; x < numCols; x++) {
    //     UtilGraphics.drawHexagon(ctx, cx, cy, radius, fill, stroke);
    //     cx += radius * 2;
    //   }
    // }
  }

  static drawHexagon(ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    fill: boolean = false,
    stroke: boolean = true) {

    const width = radius * 2;

    const angleSegment = Math.PI * 2 / 6;
    let angle = angleSegment / 2;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      if (i) {
        ctx.lineTo(x, y);
      } else {
        ctx.moveTo(x, y);
      }
      angle += angleSegment;
    }
    ctx.closePath();

    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  }

  static drawLineWithArrows(ctx: CanvasRenderingContext2D,
    x0: number, y0: number, x1: number, y1: number, aWidth: number, aLength: number, arrowStart: boolean = false, arrowEnd: boolean = true) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    //
    ctx.translate(x0, y0);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    if (arrowStart) {
      ctx.moveTo(aLength, -aWidth);
      ctx.lineTo(0, 0);
      ctx.lineTo(aLength, aWidth);
    }
    if (arrowEnd) {
      ctx.moveTo(length - aLength, -aWidth);
      ctx.lineTo(length, 0);
      ctx.lineTo(length - aLength, aWidth);
    }
    //
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

};
