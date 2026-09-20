import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import './FigureToolbar.scss';
import { MdRoundedCorner } from 'react-icons/md';
import { TbBorderCornerSquare, TbLineDashed, TbLineDotted, TbMinus } from 'react-icons/tb';
import { toolbarViewportMargin, widthList } from '../constants.js';

const clamp = (value, min, max) => {
  return Math.min(
    Math.max(value, min),
    Math.max(min, max),
  );
};

const getFigureBounds = (figure) => {
  if (figure.type === 'text') {
    const [x, y] = figure.points[0];

    return {
      left:   x,
      top:    y,
      right:  x + figure.width * figure.scale,
      bottom: y + figure.height * figure.scale,
    };
  }

  const { points: [pointA, pointB] } = figure

  const [startX, startY] = pointA;
  const [endX, endY] = pointB;

  return {
    left:   Math.min(startX, endX),
    top:    Math.min(startY, endY),
    right:  Math.max(startX, endX),
    bottom: Math.max(startY, endY),
  };
};

const FigureToolbar = ({
  figure,
  colorList,
  onChangeColor,
  onChangeWidth,
  onDelete,
  Icons,
}) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [position, setPosition] = useState({ left: 0, top: 0, placement: 'bottom' });

  const toolbarRef = useRef(null);

  const updatePosition = useCallback(() => {
    const toolbarElement = toolbarRef.current;
    if (!toolbarElement) return;

    const figureGap = 16;
    const toolbarHeight = 44;
    const submenuHeight = 36;

    const toolbarWidth = toolbarElement.offsetWidth;
    const figureBounds = getFigureBounds(figure);

    const topBoundary = toolbarViewportMargin;
    const bottomBoundary = window.innerHeight - toolbarViewportMargin;

    const topBelowFigure = figureBounds.bottom + figureGap;
    const topAboveFigure = figureBounds.top - figureGap - toolbarHeight;

    const canFitBelow = topBelowFigure + toolbarHeight + submenuHeight <= bottomBoundary;
    const canFitAbove = topAboveFigure - submenuHeight >= topBoundary;

    // Prefer below; also use it as the fallback when neither side fits.
    const shouldPlaceBelow = canFitBelow || !canFitAbove;
    const preferredTop = shouldPlaceBelow ? topBelowFigure : topAboveFigure;

    const minTop = shouldPlaceBelow
      ? topBoundary
      : topBoundary + submenuHeight;

    const maxTop = shouldPlaceBelow
      ? bottomBoundary - toolbarHeight - submenuHeight
      : bottomBoundary - toolbarHeight;

    const clampedTop = clamp(preferredTop, minTop, maxTop);

    const figureCenterX = (figureBounds.left + figureBounds.right) / 2;
    const centeredLeft = figureCenterX - toolbarWidth / 2;

    const minLeft = toolbarViewportMargin;
    const maxLeft = window.innerWidth - toolbarViewportMargin - toolbarWidth;

    const clampedLeft = clamp(centeredLeft, minLeft, maxLeft);

    setPosition({
      top: clampedTop,
      left: clampedLeft,
      placement: shouldPlaceBelow ? 'bottom' : 'top',
    });
  }, [figure]);

  useLayoutEffect(() => {
    updatePosition();
  }, [updatePosition]);

  const toggleMenu = (menuName) => {
    setOpenMenu((currentMenu) => currentMenu === menuName ? null : menuName);
  };

  const applyColor = (colorIndex) => {
    onChangeColor(colorIndex);
    setOpenMenu(null);
  };

  const applyWidth = (widthIndex) => {
    onChangeWidth(widthIndex);
    setOpenMenu(null);
  };

  const renderSubmenu = () => {
    if (!openMenu) return null;

    return (
      <div id="figure-sub-toolbar">
        {openMenu === 'color' && (
          colorList.map((color, index) => (
            <div key={color.id} className="figure-sub-item">
              <button
                tabIndex={-1}
                className={`toolbar__color-picker ${color.isRainbow ? 'color-rainbow' : ''}`}
                style={{ backgroundColor: color.color }}
                title={color.title}
                onClick={() => applyColor(index)}
              />
            </div>
          ))
        )}

        {openMenu === 'width' && (
          widthList.map((width, index) => (
            <div key={width.name} className="figure-sub-item">
              <button
                type="button"
                tabIndex={-1}
                className={`toolbar__width-picker ${width.name}`}
                title={width.title}
                onClick={() => applyWidth(index)}
              >
                <div />
              </button>
            </div>
          ))
        )}

        {openMenu === 'corners' && (
          <>
            <div className="figure-sub-item">
              <button tabIndex={-1} title="Square corners">
                <TbBorderCornerSquare />
              </button>
            </div>
            <div className="figure-sub-item">
              <button tabIndex={-1} title="Rounded corners">
                <MdRoundedCorner />
              </button>
            </div>
          </>
        )}

        {openMenu === 'stroke' && (
          <>
            <div className="figure-sub-item">
              <button tabIndex={-1} title="Solid stroke">
                <TbMinus />
              </button>
            </div>
            <div className="figure-sub-item">
              <button tabIndex={-1} title="Dashed stroke">
                <TbLineDashed />
              </button>
            </div>
            <div className="figure-sub-item">
              <button tabIndex={-1} title="Dotted stroke">
                <TbLineDotted />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      id="figure-toolbar"
      ref={toolbarRef}
      className={position.placement === 'top' ? 'above-figure' : ''}
      style={{ left: position.left, top: position.top }}
    >
      <div className="figure-sub-item">
        <button
          tabIndex={-1}
          className={`toolbar__color-picker ${colorList[figure.colorIndex].isRainbow ? 'color-rainbow' : ''}`}
          style={{ backgroundColor: colorList[figure.colorIndex].color }}
          title="Color"
          onClick={() => toggleMenu('color')}
        />
      </div>

      <div className="figure-sub-item">
        <button
          tabIndex={-1}
          className={`toolbar__width-picker ${widthList[figure.widthIndex].name}`}
          title={figure.type === 'text' ? 'Text size' : 'Line width'}
          onClick={() => toggleMenu('width')}
        >
          <div />
        </button>
      </div>

      <div className="figure-sub-item">
        <button tabIndex={-1} title="Corners" onClick={() => toggleMenu('corners')}>
          <MdRoundedCorner />
        </button>
      </div>

      <div className="figure-sub-item">
        <button tabIndex={-1} title="Stroke" onClick={() => toggleMenu('stroke')}>
          <TbMinus />
        </button>
      </div>

      <div className="figure-sub-cross-line" />

      <div className="figure-sub-item">
        <button tabIndex={-1} title="Delete" onClick={onDelete}>
          <Icons.Trash />
        </button>
      </div>

      {renderSubmenu()}
    </div>
  );
};

export default FigureToolbar;
