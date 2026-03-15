export interface ClaimedRespawn {
    userId: string;
    nickname: string;
    respawnNumber: number;
    respawnName: string;
    expiration: Date;
    channelId?: string;
    queue?: { userId: string; channelId: string }[];
  }
  
  const claimedList: ClaimedRespawn[] = []; // ← só isso

  export default claimedList;
