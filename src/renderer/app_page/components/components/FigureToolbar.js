import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import './FigureToolbar.scss';
import { MdRoundedCorner } from 'react-icons/md';
import MdSquareCorner from './icons/MdSquareCorner.js';
import { TbLineDashed, TbLineDotted, TbMinus } from 'react-icons/tb';
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

  const { points: [pointA, pointB] } = figure;

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
    const toolbarHeight = 36;
    const submenuHeight = 32; // 36 - 4 (overlap)

    const toolbarWidth = toolbarElement.offsetWidth;
    const figureBounds = getFigureBounds(figure);

    const topBoundary = toolbarViewportMargin;
    const bottomBoundary = window.innerHeight - toolbarViewportMargin;

    const topBelowFigure = figureBounds.bottom + figureGap;
    const topAboveFigure = figureBounds.top - figureGap - toolbarHeight;

    const canFitBelow = topBelowFigure + toolbarHeight + submenuHeight <= bottomBoundary;
    const canFitAbove = topAboveFigure - submenuHeight >= topBoundary;

    let placement;

    if (canFitBelow) {
      placement = 'bottom';
    } else if (canFitAbove) {
      placement = 'top';
    } else {
      placement = 'middle';
    }

    let preferredTop;
    let minTop;
    let maxTop;

    if (placement === 'bottom') {
      minTop = topBoundary;
      maxTop = bottomBoundary - toolbarHeight - submenuHeight;

      preferredTop = topBelowFigure;
    } else if (placement === 'top') {
      minTop = topBoundary + submenuHeight;
      maxTop = bottomBoundary - toolbarHeight;

      preferredTop = topAboveFigure;
    } else {
      preferredTop = figureBounds.bottom - figureGap - toolbarHeight;

      minTop = topBoundary;
      maxTop = bottomBoundary - toolbarHeight - submenuHeight;
    }

    const clampedTop = clamp(preferredTop, minTop, maxTop);

    const figureCenterX = (figureBounds.left + figureBounds.right) / 2;
    const centeredLeft = figureCenterX - toolbarWidth / 2;

    const minLeft = toolbarViewportMargin;
    const maxLeft = window.innerWidth - toolbarViewportMargin - toolbarWidth;

    const clampedLeft = clamp(centeredLeft, minLeft, maxLeft);

    setPosition({
      top: clampedTop,
      left: clampedLeft,
      placement: placement,
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

  const renderColorSubmenu = () => {
    return (
      <div className="figure-sub-toolbar">
        {colorList.map((color, index) => (
          <div key={color.id} className="figure-sub-item">
            <button
              tabIndex={-1}
              className={`toolbar__color-picker ${color.isRainbow ? 'color-rainbow' : ''}`}
              style={{ '--picker-color': color.color }}
              title={color.title}
              onClick={() => applyColor(index)}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderWidthSubmenu = () => {
    return (
      <div className="figure-sub-toolbar">
        {widthList.map((width, index) => (
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
        ))}
      </div>
    );
  };

  const renderCornersSubmenu = () => {
    return (
      <div className="figure-sub-toolbar">
        <div className="figure-sub-item">
          <button tabIndex={-1} title="Square corners">
            <MdSquareCorner />
          </button>
        </div>

        <div className="figure-sub-item">
          <button tabIndex={-1} title="Rounded corners">
            <MdRoundedCorner />
          </button>
        </div>
      </div>
    );
  };

  const renderStrokeSubmenu = () => {
    return (
      <div className="figure-sub-toolbar">
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
      </div>
    );
  };

  return (
    <div
      id="figure-toolbar"
      ref={toolbarRef}
        className={[
          position.placement === 'top' && 'above-figure',
          openMenu && 'submenu-open',
        ].filter(Boolean).join(' ')}
      style={{ left: position.left, top: position.top }}
    >
      <div className={`figure-sub-item figure-sub-item--toolbar-centered ${openMenu === 'color' ? 'active' : ''}`}>
        <button
          tabIndex={-1}
          className={`toolbar__color-picker ${colorList[figure.colorIndex].isRainbow ? 'color-rainbow' : ''}`}
          style={{ '--picker-color': colorList[figure.colorIndex].color }}
          title="Color"
          onClick={() => toggleMenu('color')}
        />

        {openMenu === 'color' && renderColorSubmenu()}
      </div>

      <div className={`figure-sub-item ${openMenu === 'width' ? 'active' : ''}`}>
        <button
          tabIndex={-1}
          className={`toolbar__width-picker ${widthList[figure.widthIndex].name}`}
          title={figure.type === 'text' ? 'Text size' : 'Line width'}
          onClick={() => toggleMenu('width')}
        >
          <div />
        </button>

        {openMenu === 'width' && renderWidthSubmenu()}
      </div>

      <div className={`figure-sub-item ${openMenu === 'corners' ? 'active' : ''}`}>
        <button
          tabIndex={-1}
          title="Corners"
          onClick={() => toggleMenu('corners')}
        >
          <MdRoundedCorner />
        </button>

        {openMenu === 'corners' && renderCornersSubmenu()}
      </div>

      <div className={`figure-sub-item ${openMenu === 'stroke' ? 'active' : ''}`}>
        <button
          tabIndex={-1}
          title="Stroke"
          onClick={() => toggleMenu('stroke')}
        >
          <TbMinus />
        </button>

        {openMenu === 'stroke' && renderStrokeSubmenu()}
      </div>

      <div className="figure-sub-cross-line" />

      <div className="figure-sub-item">
        <button
          tabIndex={-1}
          className="toolbar__delete-button"
          title="Delete"
          onClick={onDelete}
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

export default FigureToolbar;
