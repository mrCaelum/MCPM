import axios from 'axios';

export interface MCUser {
  uuid: string;
  name: string;
}

function _hex_to_uuid(hex: string) : string {
  return hex.substring(0, 8) + '-' + hex.substring(8, 4) + '-' + hex.substring(12, 4) + '-' + hex.substring(16, 4) + '-' + hex.substring(20, 12);
}

export async function getUser(playername: string) : Promise<MCUser | null> {
  const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${playername}`);
  if (response.status != 200 || response.data.id == undefined || response.data.name == undefined) return null;
  return {
    uuid: _hex_to_uuid(response.data.id),
    name: response.data.name
  };
}