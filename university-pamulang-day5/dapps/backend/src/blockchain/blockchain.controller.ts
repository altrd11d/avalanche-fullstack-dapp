import { Body, Controller, Get } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";
import { GetEventsDto } from "./dto/get-events.dto";

@Controller("blockchain")
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value
  @Get("value")
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

   //GET /blockchain/events
  @Get("events")
  async getEvents(@Body() body: GetEventsDto) {
    return this.blockchainService.getValueUpdatedEvents(
      body.fromBlock,
      body.toBlock
   );
  }
}