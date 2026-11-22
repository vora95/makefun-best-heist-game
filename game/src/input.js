// Keyboard + mouse input. Keys are tracked by code so WASD and arrows both
// work; clicks are converted to canvas coordinates for the coin toss.
export function createInput(canvas) {
  const keys = new Set();
  const state = {
    keys,
    mouseX: 0,
    mouseY: 0,
    clicked: false,
    clickX: 0,
    clickY: 0,
    // Edge-triggered presses (consumed by the game loop each frame).
    pressed: new Set(),
  };

  function keyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    if (!keys.has(e.code)) state.pressed.add(e.code);
    keys.add(e.code);
  }
  function keyUp(e) {
    keys.delete(e.code);
  }
  function mouseMove(e) {
    const r = canvas.getBoundingClientRect();
    state.mouseX = (e.clientX - r.left) * (canvas.width / r.width);
    state.mouseY = (e.clientY - r.top) * (canvas.height / r.height);
  }
  function mouseDown(e) {
    mouseMove(e);
    state.clicked = true;
    state.clickX = state.mouseX;
    state.clickY = state.mouseY;
  }

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('mousemove', mouseMove);
  canvas.addEventListener('mousedown', mouseDown);

  state.down = (code) => keys.has(code);
  state.wasPressed = (code) => state.pressed.has(code);
  state.endFrame = () => {
    state.pressed.clear();
    state.clicked = false;
  };
  state.moveVector = () => {
    let x = 0;
    let y = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) y -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  };
  state.sneaking = () => keys.has('ShiftLeft') || keys.has('ShiftRight');
  return state;
}
