// Footer with the "Reset demo data" button, so the demo can be rerun from scratch.
// It asks for a second click so nobody wipes the demo by accident mid-presentation.
import { useState } from 'react'
import { resetData } from '../data/store.js'

export default function Footer() {
  const [confirming, setConfirming] = useState(false)

  // First click arms the button; the second click actually resets.
  function handleClick() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    resetData()
    setConfirming(false)
  }

  return (
    <footer className="footer">
      <span className="muted small">Onramp prototype · sample data for demonstration</span>
      <button
        className={confirming ? 'reset-button confirming' : 'reset-button'}
        onClick={handleClick}
        onBlur={() => setConfirming(false)}
      >
        {confirming ? 'Click again to reset' : 'Reset demo data'}
      </button>
    </footer>
  )
}
