const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const errorEl = document.getElementById("error");

const FUJI_CHAIN_ID = "0xa869";

function shorten(addr) {
  return `${addr.slice(0,6)}...${addr.slice(-4)}`;
}

function showError(msg) {
  errorEl.textContent = msg;
  setTimeout(() => errorEl.textContent = "", 4000);
}

async function switchToFuji() {
  await ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: FUJI_CHAIN_ID }],
  });
}

async function updateUI() {
  const accounts = await ethereum.request({ method: "eth_accounts" });
  if (!accounts.length) return;

  const account = accounts[0];
  const chainId = await ethereum.request({ method: "eth_chainId" });

  addressEl.textContent = shorten(account);

  if (chainId !== FUJI_CHAIN_ID) {
    statusEl.textContent = "Wrong Network";
    networkEl.textContent = "Not Fuji";
    connectBtn.textContent = "Switch to Fuji";
    connectBtn.disabled = false;
    return;
  }

  statusEl.textContent = "Connected";
  networkEl.textContent = "Avalanche Fuji ✅";

  const balanceWei = await ethereum.request({
    method: "eth_getBalance",
    params: [account, "latest"]
  });

  balanceEl.textContent = (parseInt(balanceWei, 16) / 1e18).toFixed(4);

  connectBtn.textContent = "Wallet Connected";
  connectBtn.disabled = true;
}

connectBtn.onclick = async () => {
  if (!window.ethereum) {
    showError("MetaMask / Core Wallet not detected");
    return;
  }

  try {
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== FUJI_CHAIN_ID) {
      await switchToFuji();
    }
    await ethereum.request({ method: "eth_requestAccounts" });
    updateUI();
  } catch {
    showError("Action rejected by user");
  }
};

if (window.ethereum) {
  ethereum.on("accountsChanged", updateUI);
  ethereum.on("chainChanged", () => location.reload());
}

window.onload = updateUI;
