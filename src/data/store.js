// The demo's whole "database": one object in localStorage, shared by every tab.
// Tenant and Manager tabs stay in sync by listening for the browser's `storage` event.
import { useEffect, useState } from 'react'
import { STORAGE_KEY, SESSION_KEY, SEED_VERSION } from '../constants.js'
import { makeSeed } from './seed.js'

// Same-tab components don't get `storage` events, so we fire our own.
const LOCAL_EVENT = 'onramp-data-changed'

// Read the data, seeding localStorage the first time the app is opened
// (or when the saved data is from an older version of the seed).
export function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      if (data.version === SEED_VERSION) return data
    } catch {
      // Corrupted data: fall through and reseed.
    }
  }
  const seed = makeSeed()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
  localStorage.removeItem(SESSION_KEY)
  return seed
}

// Save the data and tell every listener (this tab and others) it changed.
export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

// Put the seed data back so the demo can be rerun from scratch.
export function resetData() {
  localStorage.removeItem(SESSION_KEY)
  saveData(makeSeed())
}

// Who is using the tenant tab, e.g. { inquiryId } once a renter has messaged us.
export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || {}
  } catch {
    return {}
  }
}

// Save the session and notify listeners, same as saveData.
export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(LOCAL_EVENT))
}

// Shared plumbing for the hooks below: re-read a value whenever any tab saves.
function useStored(load, key) {
  const [value, setValue] = useState(load)

  useEffect(() => {
    // Reload whenever another tab (storage) or this tab (LOCAL_EVENT) saves.
    function refresh(e) {
      if (e.type === 'storage' && e.key !== key) return
      setValue(load())
    }
    window.addEventListener('storage', refresh)
    window.addEventListener(LOCAL_EVENT, refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener(LOCAL_EVENT, refresh)
    }
  }, [load, key])

  return value
}

// React hook: gives a component the current data plus an `update` function.
// `update` takes a function that receives a copy of the data and changes it.
export function useData() {
  const data = useStored(loadData, STORAGE_KEY)

  function update(change) {
    const next = structuredClone(loadData())
    change(next)
    saveData(next)
  }

  return [data, update]
}

// React hook: the tenant tab's session plus a function to change it.
export function useSession() {
  const session = useStored(loadSession, SESSION_KEY)

  function updateSession(changes) {
    saveSession({ ...loadSession(), ...changes })
  }

  return [session, updateSession]
}

// Build a chat message. `from` is "renter", "manager", or "system" (a booking notice).
// `extras` adds special fields, e.g. { type: 'tour_offer', slots: [...] }.
export function makeMessage(from, text, extras = {}) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from,
    text,
    sentAt: new Date().toISOString(),
    type: 'text',
    ...extras,
  }
}
