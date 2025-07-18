import claimedList from "../data/claimedList.js";
import { addRespawnToList } from "./claimedListUtils.js";
import { updateClaimedListMessage } from "./updateClaimedList.js";

export class RespManager {
  async checkExpiration() {
    const now = new Date();
    const expiredRespawns = claimedList.filter(resp => resp.expiration < now);

    if (expiredRespawns.length > 0) {
      try {
        expiredRespawns.forEach(resp => {
          if (Array.isArray(resp.queue) && resp.queue.length > 0) {
            const nickname = resp.queue[0];
            const userId = resp.queue[0];
            const numero = resp.respawnNumber;
            addRespawnToList(userId, numero, nickname);
          }
          claimedList.splice(claimedList.indexOf(resp), 1);
        });
        await updateClaimedListMessage();
      } catch (error) {
        console.error(error);
      }
    }
  }
  async nextClaimed(numero: number) {
    const respawns = claimedList.filter(resp => resp.respawnNumber === numero);

    try {
      respawns.forEach(resp => {
        if (Array.isArray(resp.queue) && resp.queue.length > 0) {
              const nickname = resp.queue[0];
              const userId = resp.queue[0];
              addRespawnToList(userId, numero, nickname);
            }
      })
      await updateClaimedListMessage();
    } catch (error) {
      console.error(error);
    }
  }
}