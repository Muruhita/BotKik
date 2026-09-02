import fs from 'fs';
import path from 'path';

const PROFILE_FILE = path.join(process.cwd(), 'data', 'users.json');

function loadProfiles() {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Ошибка загрузки профилей:', error);
  }
  return {};
}

function saveProfiles(profiles) {
  try {
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(profiles, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения профилей:', error);
  }
}

export function getProfile(userId) {
  const profiles = loadProfiles();
  return profiles[userId] || null;
}

export function setProfile(userId, profile) {
  const profiles = loadProfiles();
  profiles[userId] = profile;
  saveProfiles(profiles);
}

export function getAllProfiles() {
  return loadProfiles();
}