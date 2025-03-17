import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import styles from "./app.module.scss";
import cn from "classnames";
import Web3 from "web3";

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
  const [field, setField] = useState(createField(size, countMines));
  const [ethWallet, setEthWallet] = useState(null);
  const [userAcc, setUserAcc] = useState(null);
  const [connectError, setConnectError] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  // 0 - filled, 1 - checked, 2 - flagged, -1 bomb
  const [mask, setMask] = useState(new Array(100).fill(0));

  const clickMine = (x, y) => {
    if (isGameOver) return;
    if (mask[x * size + y] === 1 || mask[x * size + y] === 2) return;
    if (field[x * size + y] === -1) {
      setMask(() =>
        mask.map((value, n) => {
          if (field[n] === -1) return -1;

          return value;
        })
      );
      setIsGameOver(true);
      setTimeout(() => {
        return alert("you lost");
      }, 100);
      return;
    }

    const win = () => {};

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
  };

  const flagged = (e, x, y) => {
    e.preventDefault();

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
  async function connectWallet() {
    const chainId = 10143; //

    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: web3.utils.toHex(chainId) }],
        });
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Monad testntet",
                chainId: web3.utils.toHex(chainId),
                nativeCurrency: {
                  name: "MONC",
                  decimals: 18,
                  symbol: "MON",
                },
                rpcUrls: ["https://testnet-rpc.monad.xyz/"],
              },
            ],
          });
        }
      }
    } else return;

    try {
      // If MetaMask is not installed, throw error.
      if (!ethWallet) {
        const errMsg = "Please install MetaMask first";
        setConnectError(errMsg);
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      await setLoggedIn(true);

      // Reset error
      if (connectError !== null) {
        setConnectError(null);
      }

      window.location.reload(false);
      return;
    } catch (error) {
      setConnectError(error.message);
      console.error(error);
      return;
    }
  }

  async function checkWalletConnection() {
    const ethereum = window.ethereum;
    await setEthWallet(!ethereum ? false : true);

    // If installed, get user's accounts.
    if (ethereum) {
      const web3Instance = new Web3(window.ethereum);

      const userAcc = await web3Instance.eth.requestAccounts();

      if (userAcc.length > 0) {
        await setUserAcc(userAcc[0]);
        await setLoggedIn(true);
      } else {
        if (loggedIn) {
          await setUserAcc(null);
          await setLoggedIn(false);
        }
      }
    }
  }

  useEffect(() => {
    if (ethWallet === null) {
      checkWalletConnection();
    }
  }, [ethWallet]);

  return (
    <>
      <button onClick={connectWallet}>COnnect wallet && {userAcc}</button>
      <div className={styles.main}>
        <div className={styles.settings}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label>Bet</label>
            <input
              value={countMines}
              onChange={(e) => setCountMines(e.target.value)}
              placeholder="amount mon"
              type="number"
            />
            <label>Mines</label>
            <input
              value={bet}
              onChange={(e) => setBet(e.target.value)}
              placeholder="count mines"
              type="number"
            />
          </div>
          <button>Play</button>
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
    </>
  );
}

export default App;
