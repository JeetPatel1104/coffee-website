const header = document.querySelector('.site-header')
const toggle = document.querySelector('.nav-toggle')
const themeToggle = document.querySelector('.theme-toggle')

function setNavOpen(isOpen) {
  if (!header || !toggle) return
  header.classList.toggle('nav-open', isOpen)
  toggle.setAttribute('aria-expanded', String(isOpen))
}

toggle?.addEventListener('click', () => {
  const isOpen = header?.classList.contains('nav-open')
  setNavOpen(!isOpen)
})

// Close the menu when a link is clicked (mobile)
document.querySelectorAll('.nav-links a').forEach((a) => {
  a.addEventListener('click', () => setNavOpen(false))
})

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setNavOpen(false)
})

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme')
    const icon = themeToggle.querySelector('.icon')
    if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀'
  }
}

function getInitialTheme() {
  const saved = localStorage.getItem('theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia?.('(prefers-color-scheme: light)')?.matches ? 'light' : 'dark'
}

applyTheme(getInitialTheme())

themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
  const next = current === 'light' ? 'dark' : 'light'
  localStorage.setItem('theme', next)
  applyTheme(next)
})

// Simple entrance animations
document.addEventListener('DOMContentLoaded', () => {
  const hero = document.querySelector('.hero')
  hero?.classList.add('fade-up')

  const cards = Array.from(document.querySelectorAll('.card'))
  cards.forEach((card, i) => {
    card.classList.add('fade-up')
    if (i % 4 === 1) card.classList.add('delay-1')
    if (i % 4 === 2) card.classList.add('delay-2')
    if (i % 4 === 3) card.classList.add('delay-3')
  })
})

// Simple cart (menu.html)
const CART_KEY = 'brewbean_cart_v1'

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed

    // Backward compatibility if older array format exists
    if (Array.isArray(parsed)) {
      const next = {}
      parsed.forEach((it) => {
        const id = String(it.id || it.name || Date.now())
        const prev = next[id]
        if (prev) prev.qty += 1
        else next[id] = { id, name: it.name || 'Item', price: Number(it.price) || 0, image: it.image || '', qty: 1 }
      })
      return next
    }
    return {}
  } catch {
    return {}
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function formatINR(amount) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      amount,
    )
  } catch {
    return `₹${amount}`
  }
}

function renderCart() {
  const itemsEl = document.getElementById('cart-items')
  const totalEl = document.getElementById('cart-total')
  if (!itemsEl || !totalEl) return

  const cart = readCart()
  const items = Object.values(cart)

  if (items.length === 0) {
    itemsEl.textContent = 'No items yet.'
    totalEl.textContent = formatINR(0)
    return
  }

  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0)
  itemsEl.innerHTML = items
    .map(
      (it) => `
      <div class="cart-item">
        <span>${it.name} (${formatINR(Number(it.price) || 0)})</span>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="decrease" data-id="${it.id}">−</button>
          <span class="qty-value">${it.qty}</span>
          <button type="button" class="qty-btn" data-action="increase" data-id="${it.id}">+</button>
        </div>
      </div>
    `,
    )
    .join('')

  totalEl.textContent = formatINR(total)
}

document.querySelectorAll('.add-to-cart').forEach((btn) => {
  btn.addEventListener('click', () => {
    const b = btn
    const id = b.getAttribute('data-product-id') || String(Date.now())
    const cart = readCart()
    const existing = cart[id]
    if (existing) {
      existing.qty += 1
    } else {
      cart[id] = {
        id,
        name: b.getAttribute('data-name') || 'Item',
        price: Number(b.getAttribute('data-price') || 0),
        image: b.getAttribute('data-image') || '',
        qty: 1,
      }
    }
    writeCart(cart)
    renderCart()
  })
})

document.getElementById('cart-order')?.addEventListener('click', () => {
  const cart = readCart()
  const items = Object.values(cart)
  if (items.length === 0) {
    alert('Your cart is empty. Add some coffee first.')
    return
  }
  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0)
  alert(`Order placed successfully! Total: ${formatINR(total)}`)
  writeCart({})
  renderCart()
})

document.getElementById('cart-items')?.addEventListener('click', (e) => {
  const target = e.target
  if (!(target instanceof HTMLButtonElement)) return
  const action = target.getAttribute('data-action')
  const id = target.getAttribute('data-id')
  if (!action || !id) return

  const cart = readCart()
  const item = cart[id]
  if (!item) return

  if (action === 'increase') item.qty += 1
  if (action === 'decrease') item.qty -= 1
  if (item.qty <= 0) delete cart[id]

  writeCart(cart)
  renderCart()
})

renderCart()

// Feedback form validation (index.html)
const feedbackForm = document.getElementById('feedback-form')
const feedbackInput = document.getElementById('feedback')
const feedbackError = document.getElementById('feedback-error')
const feedbackSuccess = document.getElementById('feedback-success')

feedbackForm?.addEventListener('submit', (e) => {
  e.preventDefault()
  if (!(feedbackInput instanceof HTMLTextAreaElement)) return

  const value = feedbackInput.value.trim()
  const isValid = value.length >= 5

  if (!isValid) {
    feedbackError?.removeAttribute('hidden')
    feedbackSuccess?.setAttribute('hidden', '')
    feedbackInput.setAttribute('aria-invalid', 'true')
    feedbackInput.focus()
    return
  }

  feedbackError?.setAttribute('hidden', '')
  feedbackSuccess?.removeAttribute('hidden')
  feedbackInput.setAttribute('aria-invalid', 'false')
  feedbackForm.reset()
})

