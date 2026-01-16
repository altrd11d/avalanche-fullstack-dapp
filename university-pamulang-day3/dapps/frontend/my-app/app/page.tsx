'use client';

import { useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { injected } from 'wagmi/connectors';
import { avalancheFuji } from 'wagmi/chains';

// ==============================
// 🔹 CONFIG
// ==============================
const CONTRACT_ADDRESS = '0x1309d1442fefc94694ea965f76147004b02d6f68';

const SIMPLE_STORAGE_ABI = [
  {
    inputs: [],
    name: 'getValue',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_value', type: 'uint256' }],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// ==============================
// 🔹 HELPER
// ==============================
const shortAddress = (addr?: string) =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export default function Page() {
  // ==============================
  // 🔹 WALLET
  // ==============================
  const { address, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const isWrongNetwork = chainId !== avalancheFuji.id;

  // ==============================
  // 🔹 LOCAL STATE
  // ==============================
  const [inputValue, setInputValue] = useState('');
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // ==============================
  // 🔹 READ CONTRACT
  // ==============================
  const {
    data: value,
    isLoading: isReading,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SIMPLE_STORAGE_ABI,
    functionName: 'getValue',
    query: {
      enabled: isConnected && !isWrongNetwork,
    },
  });

  // ==============================
  // 🔹 WRITE CONTRACT
  // ==============================
  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
  } = useWriteContract();

  const { isSuccess, isLoading: isConfirming } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // ==============================
  // 🔹 EFFECT: TX SUCCESS
  // ==============================
  useEffect(() => {
    if (isSuccess) {
      setTxStatus('Transaction confirmed 🎉');
      setInputValue('');
      refetch();
    }
  }, [isSuccess, refetch]);

  // ==============================
  // 🔹 HANDLER
  // ==============================
  const handleSetValue = async () => {
    if (!inputValue) return;

    try {
      setTxStatus('Waiting for wallet confirmation...');

      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'setValue',
        args: [BigInt(inputValue)],
      });

      setTxStatus('Transaction sent. Waiting for confirmation...');
    } catch (err: any) {
      if (err?.code === 4001) {
        setTxStatus('Transaction rejected by user');
      } else if (err?.shortMessage) {
        setTxStatus(err.shortMessage);
      } else {
        setTxStatus('Transaction failed');
      }
    }
  };

  // ==============================
  // 🔹 UI
  // ==============================
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-6 space-y-6">

        <h1 className="text-xl font-bold">
          Day 3 – Frontend dApp (Avalanche)
        </h1>

        {/* ==========================
            WALLET CONNECT
        ========================== */}
        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            disabled={isConnecting}
            className="w-full bg-white text-black py-2 rounded"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-400">Connected</p>
            <p className="font-mono text-sm">
              {shortAddress(address)}
            </p>
            <button
              onClick={() => disconnect()}
              className="text-red-400 text-sm underline"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* ==========================
            NETWORK WARNING
        ========================== */}
        {isWrongNetwork && (
          <p className="text-red-400 text-sm">
            Wrong network — please switch to Avalanche Fuji
          </p>
        )}

        {/* ==========================
            READ CONTRACT
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-2">
          <p className="text-sm text-gray-400">Contract Value</p>

          {isReading ? (
            <p>Loading...</p>
          ) : (
            <p className="text-2xl font-bold">
              {value?.toString()}
            </p>
          )}

          <button
            onClick={() => refetch()}
            className="text-sm underline text-gray-300"
          >
            Refresh
          </button>
        </div>

        {/* ==========================
            WRITE CONTRACT
        ========================== */}
        <div className="border-t border-gray-700 pt-4 space-y-3">
          <input
            type="number"
            placeholder="New value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 rounded bg-black border border-gray-600"
          />

          <button
            onClick={handleSetValue}
            disabled={
              isWriting ||
              isConfirming ||
              isWrongNetwork ||
              !inputValue
            }
            className={`w-full py-2 rounded ${
              isWriting || isConfirming
                ? 'bg-gray-600'
                : 'bg-blue-600'
            }`}
          >
            {isWriting
              ? 'Waiting wallet...'
              : isConfirming
              ? 'Confirming...'
              : 'Set Value'}
          </button>
        </div>

        {/* ==========================
            TX STATUS
        ========================== */}
        {txStatus && (
          <p className="text-sm text-yellow-400">
            {txStatus}
          </p>
        )}

        <p className="text-xs text-gray-500 pt-2">
          Smart contract = single source of truth
        </p>
      </div>
    </main>
  );
}
