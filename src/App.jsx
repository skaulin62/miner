import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import styles from "./app.module.scss";
import cn from "classnames";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import toast, { Toaster } from "react-hot-toast";

const createField = (size, countMines) => {
  const field = new Array(100).fill(0);

  const calcNear = (x, y) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      if (field[x * size + y] === -1) return;
      field[x * size + y] += 1;
    }
  };

  for (let i = 0; i < countMines; ) {
    let x = Math.floor(Math.random() * size);
    let y = Math.floor(Math.random() * size);
    let posMine = x * size + y;
    if (field[posMine] === -1) continue;
    field[posMine] = -1;
    i++;
    calcNear(x + 1, y);
    calcNear(x - 1, y);
    calcNear(x, y - 1);
    calcNear(x, y + 1);

    calcNear(x + 1, y + 1);
    calcNear(x - 1, y + 1);
    calcNear(x + 1, y - 1);
    calcNear(x - 1, y - 1);
  }
  return field;
};

function App() {
  const [isGameOver, setIsGameOver] = useState(false);
  const [isStart, setIStart] = useState(false);
  const [countMines, setCountMines] = useState(20);
  const [bet, setBet] = useState(1);
  const size = 10;
  const [field, setField] = useState([]);

  const [mask, setMask] = useState(new Array(100).fill(0));

  const checkWin = () => {
    const countChecked = mask.filter((value) => value === 1).length;

    if (countChecked == size ** 2 - countMines) return true;
    return false;
  };

  const startGame = () => {
    if (countMines >= 50 || countMines < 20)
      return toast.error("mines range: 20 - 50");

    if (isStart) return;
    if (isGameOver) setIsGameOver(false);
    setMask(() => new Array(100).fill(0));
    setIStart(true);
    setField(createField(size, countMines));
  };

  const clickMine = (x, y) => {
    if (!isStart) return;
    if (mask[x * size + y] === 1 || mask[x * size + y] === 2) return;

    if (isGameOver) return;

    if (field[x * size + y] === -1) {
      setMask(() =>
        mask.map((value, n) => {
          if (field[n] === -1) return -1;

          return value;
        })
      );
      setIsGameOver(true);
      setTimeout(() => {
        return toast("You lost, loser(", { icon: "😭" });
      }, 100);
      setField([]);

      setIStart(false);
      return;
    }

    setMask(() =>
      mask.map((value, n) => {
        if (n === x * size + y) return 1;
        return value;
      })
    );

    const clearing = [];

    const clear = (x, y) => {
      if (x < 0 || x >= size || y < 0 || y >= size) return;

      if (mask[x * size + y] === 1) return;
      clearing.push({ x: x, y: y });
    };

    clear(x, y);

    while (clearing.length) {
      const { x, y } = clearing.pop();
      mask[x * size + y] = 1;
      if (field[x * size + y] !== 0) continue;

      clear(x + 1, y);
      clear(x - 1, y);
      clear(x, y - 1);
      clear(x, y + 1);

      setMask(() =>
        mask.map((value, n) => {
          if (n === x * size + y) return 1;
          return value;
        })
      );
    }
    if (checkWin()) {
      setTimeout(() => {
        return toast.success("You won!!!!!!!!!!!!!!!!!!!");
      }, 100);
      setIStart(false);
      setField([]);
      setMask(new Array(100).fill(0));
      return;
    }
  };

  const flagged = (e, x, y) => {
    e.preventDefault();
    if (!isStart) return;
    if (isGameOver) return;
    if (mask[x * size + y] === 1) return;

    setMask(() =>
      mask.map((value, n) => {
        if (n === x * size + y) {
          if (value === 2) {
            return 0;
          } else {
            return 2;
          }
        }
        return value;
      })
    );
  };

  return (
    <>
      <div className={styles.wrapper}>
        <Toaster
          position="left-top"
          containerStyle={{ position: "absolute" }}
          reverseOrder={false}
        />
        <div className={styles.connectBtn}>
          <ConnectButton />
        </div>
        <div className={styles.main}>
          <div className={styles.settings}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label>Bet</label>
              <input
                disabled={isStart}
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                placeholder="amount mon"
                type="number"
              />
              <label>Mines</label>
              <input
                disabled={isStart}
                value={countMines}
                onChange={(e) => setCountMines(e.target.value)}
                placeholder="count mines"
                type="number"
              />
              <div>mines range: 20 - 50</div>
            </div>

            <button disabled={isStart} onClick={startGame}>
              Play
            </button>
          </div>
          <div className={styles.wrapBoard}>
            {[...Array(size)].map((_, y) => {
              return (
                <div key={y} className={styles.boardLine}>
                  {[...Array(size)].map((_, x) => {
                    return (
                      <div
                        onContextMenu={(e) => flagged(e, x, y)}
                        onClick={() => clickMine(x, y)}
                        key={x}
                        className={cn(
                          styles.tile,
                          {
                            [styles.tileChecked]: mask[x * size + y] === 1,
                          },
                          {
                            [styles.tileFlagged]: mask[x * size + y] === 2,
                          },
                          {
                            [styles.tileBomb]: mask[x * size + y] === -1,
                          }
                        )}
                      >
                        {mask[x * size + y] === 1
                          ? field[x * size + y] > 0
                            ? field[x * size + y]
                            : ""
                          : ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
