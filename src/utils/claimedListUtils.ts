import claimedList, { ClaimedRespawn } from '../data/claimedList.js';
import { RESPAWNS } from '../data/respawns.js';
import { saveClaimedList } from './storageUtils.js';

export function addRespawnToList(userId: string, respawnNumber: number, nickname: string) {
    const respawnName = RESPAWNS[respawnNumber] || 'Desconhecido';
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 2);
  
    const newRespawn: ClaimedRespawn = {
      userId,
      nickname,
      respawnNumber,
      respawnName,
      expiration,
      queue: [],
    };

    // Verificar se claimedList está definido
    if (!claimedList) {
      console.error('claimedList não está definido');
      return;
    }

    console.log('✅ Adicionando ao claimedList:', newRespawn);
    claimedList.push(newRespawn);
    saveClaimedList(claimedList);
}


export function removeRespawn(userId: string, respawnNumber: number) {
    const index = claimedList.findIndex(
      (resp) => resp.userId === userId && resp.respawnNumber === respawnNumber
    );
    
    if (index !== -1) {
      claimedList.splice(index, 1); // Remova o item da lista real
      console.log(`Respawn ${respawnNumber} removido do usuário ${userId}`);
      saveClaimedList(claimedList); // Salve a lista atualizada
      return true;
    }
    
    saveClaimedList(claimedList); // Salve mesmo que não tenha removido
    return false;
  }
  