import {useChatStore} from '../store/useChatStore'

const {onlineUsers,typingUsers} = useChatStore.getState()

export const getUserStatus = (id)=>{
    return onlineUsers.get(id)?.isOnline || false
}

export const getlastSeen = (id)=>{
    return onlineUsers.get(id)?.lastSeen || null
  }

