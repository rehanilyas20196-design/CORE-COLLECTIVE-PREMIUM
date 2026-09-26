'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import './contact.css';

export default function ContactPage() {
  const progressBar = useRef(null);
  const formRef = useRef(null);
  const sendBtnRef = useRef(null);
  const toastRef = useRef(null);
  const toastMsgRef = useRef(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  const faqTimeout = useRef(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const bar = progressBar.current;
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      bar.style.width = scrolled + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('.faq-item');
    const handleToggle = (e) => {
      const q = e.currentTarget;
      const wrap = q.nextElementSibling;
      const isOpen = q.parentElement.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach((other) => {
        other.classList.remove('open');
        other.querySelector('.faq-a-wrap').style.maxHeight = null;
      });

      if (!isOpen) {
        q.parentElement.classList.add('open');
        wrap.style.maxHeight = wrap.scrollHeight + 'px';
      }
    };

    items.forEach((item) => {
      const q = item.querySelector('.faq-q');
      q.addEventListener('click', handleToggle);
    });

    return () => {
      items.forEach((item) => {
        const q = item.querySelector('.faq-q');
        q.removeEventListener('click', handleToggle);
      });
    };
  }, []);

  const fireShineAndToast = useCallback((type, msg) => {
    const btn = sendBtnRef.current;
    const toast = toastRef.current;
    btn.classList.remove('fire');
    void btn.offsetWidth;
    btn.classList.add('fire');

    toastMsgRef.current.textContent = msg;
    toast.className = `toast${type === 'error' ? ' error' : ''}`;

    void toast.offsetWidth;
    toast.classList.add('show');
    if (faqTimeout.current) clearTimeout(faqTimeout.current);
    faqTimeout.current = setTimeout(() => toast.classList.remove('show'), 4200);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    setSending(true);
    try {
      await api.contactMessages.create(
        nameRef.current.value,
        emailRef.current.value,
        phoneRef.current.value,
        subjectRef.current.value,
        messageRef.current.value
      );
      formRef.current.reset();
      fireShineAndToast('success', 'Message sent — we\u2019ll get back to you within one business day.');
    } catch (err) {
      fireShineAndToast('error', err?.message || 'Something went wrong — please try again or email us directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <div ref={progressBar} className="progress-bar" />

      <section className="hero">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
        <div className="wrap">
          <div className="hero-inner">
            <div className="hero-copy">
              <button
                className="back-btn reveal"
                style={{ animationDelay: '.05s' }}
                onClick={() => window.history.back()}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              </button>
              <h1 className="display gold-shimmer reveal" style={{ animationDelay: '.15s' }}>Get in Touch</h1>
              <p className="reveal" style={{ animationDelay: '.3s' }}>Have a question about bulk orders, partnerships, or need help? Our team is here to help.</p>
            </div>

            <div className="hero-mail reveal" style={{ animationDelay: '.45s' }}>
              <div className="mail-halo" />
              <svg className="mail-scene" viewBox="0 0 300 300" aria-hidden="true">
                <defs>
                  <linearGradient id="trailFade" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#E9C77B" stopOpacity="0"/>
                    <stop offset="45%" stopColor="#E9C77B" stopOpacity="0.9"/>
                    <stop offset="100%" stopColor="#F6DFA0" stopOpacity="0.15"/>
                  </linearGradient>
                  <linearGradient id="flapShade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9A94F"/>
                    <stop offset="100%" stopColor="#B9873A"/>
                  </linearGradient>
                </defs>

                <ellipse className="mail-shadow" cx="150" cy="232" rx="78" ry="9"/>

                <g className="envelope">
                  <path className="env-back" d="M62 122 L150 192 L238 122 L238 218 L62 218 Z"/>

                  <path className="env-inner-shadow" d="M78 128 L150 178 L222 128 L222 168 L150 208 L78 168 Z"/>

                  <g className="letter">
                    <rect className="letter-fold-shadow" x="86" y="92" width="128" height="82" rx="6"/>
                    <rect x="82" y="88" width="136" height="88" rx="7"/>
                    <line className="letter-crease" x1="150" y1="94" x2="150" y2="170"/>
                    <line x1="98" y1="112" x2="202" y2="112"/>
                    <line x1="98" y1="131" x2="188" y2="131"/>
                    <line x1="98" y1="150" x2="202" y2="150"/>
                    <line x1="98" y1="169" x2="160" y2="169"/>
                  </g>

                  <path className="env-front" d="M62 150 L150 208 L238 150 L238 218 L62 218 Z"/>

                  <g className="env-flap-group">
                    <path className="env-flap-inner" d="M62 122 L150 190 L238 122 Z"/>
                    <path className="env-flap" d="M62 122 L150 190 L238 122 Z"/>
                    <line className="env-flap-crease" x1="62" y1="122" x2="150" y2="190"/>
                    <line className="env-flap-crease" x1="238" y1="122" x2="150" y2="190"/>
                  </g>

                  <rect className="env-outline" x="62" y="122" width="176" height="96" rx="7"/>
                </g>

                <path className="plane-trail" d="M150,128 Q 205,72 258,26 Q 296,-8 328,-52"/>

                <g className="sparkle">
                  <line x1="150" y1="108" x2="150" y2="92"/>
                  <line x1="150" y1="152" x2="150" y2="168"/>
                  <line x1="130" y1="130" x2="114" y2="130"/>
                  <line x1="170" y1="130" x2="186" y2="130"/>
                  <line x1="136" y1="116" x2="124" y2="104"/>
                  <line x1="164" y1="144" x2="176" y2="156"/>
                </g>

                <g className="paper-plane">
                  <path className="plane-wing" d="M150 86 L222 152 L150 132 L78 152 Z"/>
                  <path className="plane-fold" d="M150 132 L150 170 L112 156 Z"/>
                  <line className="plane-spine" x1="150" y1="86" x2="150" y2="170"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="wrap">
          <div className="grid">
            <div className="left-col">
              <div className="card info-card reveal" style={{ animationDelay: '.4s' }}>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><path d="M2 6h20v12H2z"/></svg>
                  </div>
                  <div>
                    <div className="info-label">EMAIL</div>
                    <div className="info-value">ecommerce_corecollective@gmail.com</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <div className="info-label">PHONE</div>
                    <div className="info-value">+92 345 5900229</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <div className="info-label">ADDRESS</div>
                    <div className="info-value">Karachi, Pakistan</div>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <div>
                    <div className="info-label">BUSINESS HOURS</div>
                    <div className="info-value">Mon–Sat: 9:00 AM – 6:00 PM PKT</div>
                  </div>
                </div>
              </div>

              <div className="card reveal" style={{ animationDelay: '.5s' }}>
                <div className="follow-title display">Follow Us</div>
                <div className="follow-row">
                  <a className="follow-chip" href="https://www.linkedin.com/in/rehan-ilyas-6976793a7" target="_blank" rel="noreferrer">LinkedIn</a>
                  <a className="follow-chip" href="#">Twitter</a>
                  <a className="follow-chip" href="#">Facebook</a>
                  <a className="follow-chip" href="#">Instagram</a>
                </div>
              </div>
            </div>

            <div className="card reveal" style={{ animationDelay: '.55s' }}>
              <form ref={formRef} onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="field">
                    <label>Full Name</label>
                    <input ref={nameRef} type="text" placeholder="Name" required />
                  </div>
                  <div className="field">
                    <label>Email Address</label>
                    <input ref={emailRef} type="email" placeholder="Email" required />
                  </div>
                  <div className="field">
                    <label>Phone (optional)</label>
                    <input ref={phoneRef} type="text" placeholder="Phone" />
                  </div>
                  <div className="field">
                    <label>Subject</label>
                    <input ref={subjectRef} type="text" placeholder="Subject" required />
                  </div>
                  <div className="field full">
                    <label>Message</label>
                    <textarea ref={messageRef} placeholder="Message" required />
                  </div>
                </div>
                <button type="submit" className="send-btn" ref={sendBtnRef} disabled={sending}>
                  <span className="btn-shine" />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  Send Message
                </button>
                <div ref={toastRef} className="toast">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><polyline points="20 6 9 17 4 12"/></svg>
                  <span ref={toastMsgRef} />
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="wrap">
          <div className="faq-head">
            <h2 className="display gold-shimmer">Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {[
              { q: 'How do I place a wholesale order?', a: 'Browse the catalog, add products to your cart at wholesale pricing, and check out. Verified buyers can also request custom quotes directly from a supplier\u2019s profile.' },
              { q: 'What is the minimum order quantity?', a: 'Minimum order quantities vary by supplier and product category. Each listing shows its MOQ clearly before you add it to your cart.' },
              { q: 'Do you offer international shipping?', a: 'Yes. Many of our suppliers ship internationally. Shipping cost and delivery time are calculated at checkout based on destination and order weight.' },
              { q: 'How can I become a supplier?', a: 'Click "Become a Supplier" in the navigation bar, complete your business verification, and list your first products. Our team reviews new suppliers within two business days.' },
              { q: 'What payment methods are accepted?', a: 'We accept secure international payments via Paddle — Visa, Mastercard, PayPal, Apple Pay, Google Pay and more. Enterprise buyers can also arrange net-30 invoicing.' }
            ].map((faq, i) => (
              <div key={i} className="faq-item">
                <button className="faq-q">
                  {faq.q}
                  <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className="faq-a-wrap"><div className="faq-a">{faq.a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}