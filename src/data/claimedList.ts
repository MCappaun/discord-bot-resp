export interface ClaimedRespawn {
    userId: string;
    nickname: string;
    respawnNumber: number;
    respawnName: string;
    expiration: Date;
    queue?: string[];
  }
  
  const claimedList: ClaimedRespawn[] = []; // ← só isso

  export default claimedList;