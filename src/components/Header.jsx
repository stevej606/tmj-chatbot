import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
      <div className="header-text">
        <h1 className="header-title">TMJ Health Assistant</h1>
        <span className="header-subtitle">AI-Powered TMJ Support</span>
      </div>
    </header>
  );
}

export default Header;
