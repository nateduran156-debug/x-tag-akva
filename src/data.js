const whitelist = [];
const tags = [];

export function addToWhitelist(userId, addedBy) {
  if (whitelist.some((entry) => entry.userId === userId)) {
    return false;
  }

  whitelist.push({
    userId,
    addedBy,
    addedAt: new Date().toISOString(),
  });

  return true;
}

export function removeFromWhitelist(userId) {
  const index = whitelist.findIndex((entry) => entry.userId === userId);

  if (index === -1) {
    return false;
  }

  whitelist.splice(index, 1);
  return true;
}

export function addTag(username, userId) {
  const entry = {
    username,
    userId,
    accepted: false,
    createdAt: new Date().toISOString(),
  };

  tags.push(entry);
  return entry;
}

export function acceptTag(username, userId) {
  const matchingTag = [...tags]
    .reverse()
    .find((entry) => entry.username.toLowerCase() === username.toLowerCase());

  if (matchingTag) {
    matchingTag.accepted = true;
    matchingTag.acceptedBy = userId;
    matchingTag.acceptedAt = new Date().toISOString();
    return matchingTag;
  }

  const entry = {
    username,
    userId,
    accepted: true,
    createdAt: new Date().toISOString(),
    acceptedBy: userId,
    acceptedAt: new Date().toISOString(),
  };

  tags.push(entry);
  return entry;
}

export function getRecentTags(limit = 15) {
  return tags.slice(-limit).reverse();
}