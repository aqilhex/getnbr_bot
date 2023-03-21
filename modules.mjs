const admin = {
    mute: async (user_id) => {
        await redis.v4.hSet(`telegram:${user_id}`,'action','mute');
    }
}

export default {
    admin
}