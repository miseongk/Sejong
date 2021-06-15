const _query = require("../../database/db");

async function findRoom(user1, user2) {
  const room = await _query(
    `SELECT room_id FROM ChatRoom 
        WHERE (user1=${user1} AND user2=${user2}) OR (user1=${user2} AND user2=${user1}); `
  );
  return room[0].room_id;
}

module.exports = { findRoom };