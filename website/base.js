export async function readUserJSON() {
  const response = await fetch('userBase.json');
  const data = await response.json();
  return data;
}

export async function readKeysJSON() {
  const response = await fetch('keysBase.json');
  const data = await response.json();
  return data;
}

export function logPlayer(Base, name, password) {
  return Base.some(user => user.login === name && user.password === password);
}

export function getUserByLogin(Base, name) {
  return Base.find(user => user.login === name);
}