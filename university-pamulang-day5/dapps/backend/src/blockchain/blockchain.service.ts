
import { Injectable } from "@nestjs/common";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import SimpleStorage from "./SimpleStorage.json";

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http(process.env.RPC_URL),
    });

    // GANTI dengan address hasil deploy Day 2
    this.contractAddress = 
    process.env.CONTRACT_ADDRESS as "0x${string}";

    if (!this.contractAddress || !process.env.RPC_URL) {
    throw new Error("RPC_URL or CONTRACT_ADDRESS is not defined");
    }
  } 

  // 🔹 Read latest value
  async getLatestValue() {
    const value = await this.client.readContract({
      address: this.contractAddress,
      abi: SimpleStorage.abi,
      functionName: "getValue",
    });

    return {
      value: value.toString(),
    };
  }

  // 🔹 Read ValueUpdated events
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    const events = await this.client.getLogs({
      address: this.contractAddress,
      event: {
        type: "event",
        name: "ValueUpdated",
        inputs: [
          {
            name: "newValue",
            type: "uint256",
            indexed: false,
          },
        ],
      },
      fromBlock: BigInt(fromBlock), // speaker demo (jelaskan ini anti-pattern)
      toBlock: BigInt(toBlock),
    });

    return events.map((event) => ({
      blockNumber: event.blockNumber?.toString(),
      value: event.args.newValue.toString(),
      txHash: event.transactionHash,
    }));
  }
}