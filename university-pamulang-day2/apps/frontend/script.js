const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

// ================= STATE =================
let currentAccount = null;
let isConnectedByUser = false;
const studentInfo = " | ALFITRI DEVIANI | NIM: 221011450319";

// Avalanche Fuji Testnet ChainId (hex)
const AVALANCE_FUJI_CHAIN_ID = "0xa869";

// ================= HELPERS =================
function shortAddress(addr) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formAvaxBalance(balanceWei) {
    const balance = parseInt(balanceWei, 16);
    return (balance / 1e18).toFixed(4);
}

console.log("script loaded");

// ================= MAIN =================
async function connectWallet() {
    if (typeof window.ethereum === "undefined") {
        alert("Core Wallet tidak terdeteksi. Silahkan install Core Wallet.");
        return;
    }

    try {
        statusEl.textContent = "Connecting...";

        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        isConnectedByUser = true;

        const address = accounts[0];
        currentAccount = address;

        // 🧠 IMPORTANT PATCH: wait for wallet handshake
        await new Promise(resolve => setTimeout(resolve, 300));

        const chainId = (await window.ethereum.request({ method: "eth_chainId" })).toLowerCase();

        if (chainId === AVALANCE_FUJI_CHAIN_ID) {

            addressEl.textContent = shortAddress(address) + studentInfo;
            networkEl.textContent = "Avalanche Fuji Testnet";
            statusEl.textContent = "Connected";
            statusEl.style.color = "#4cd137";

            connectBtn.disabled = true;
            connectBtn.textContent = "Connected";

            const balanceWei = await window.ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
            });

            balanceEl.textContent = formAvaxBalance(balanceWei) + "";

        } else {
            networkEl.textContent = "Wrong Network";
            statusEl.textContent = "Please switch to Avalanche Fuji";
            statusEl.style.color = "#fbc531";
            addressEl.textContent = "-";
            balanceEl.textContent = "-";
        }

    } catch (error) {
        console.error(error);
        statusEl.textContent = "Connection Failed";
        statusEl.style.color = "red";
    }
}

// ================= EVENTS =================
connectBtn.addEventListener("click", connectWallet);

// Wallet events (only active after user connect)
if (window.ethereum) {

    window.ethereum.on("accountsChanged", async (accounts) => {
        if (!isConnectedByUser) return;

        if (accounts.length === 0) {
            statusEl.textContent = "Disconnected";
            connectBtn.disabled = false;
            connectBtn.textContent = "Connect Wallet";
            addressEl.textContent = "-";
            balanceEl.textContent = "-";
            return;
        }

        const address = accounts[0];
        currentAccount = address;

        addressEl.textContent = shortAddress(address) + studentInfo;

        const balanceWei = await window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"],
        });

        balanceEl.textContent = formAvaxBalance(balanceWei) + "";
    });

    window.ethereum.on("chainChanged", (chainId) => {
        if (!isConnectedByUser) return;

        if (chainId.toLowerCase() === AVALANCE_FUJI_CHAIN_ID) {
            networkEl.textContent = "Avalanche Fuji Testnet";
            statusEl.textContent = "Connected";
            statusEl.style.color = "#4cd137";
        } else {
            networkEl.textContent = "Wrong Network";
            statusEl.textContent = "Please switch to Avalanche Fuji";
            statusEl.style.color = "#fbc531";
            balanceEl.textContent = "-";
        }
    });

}
