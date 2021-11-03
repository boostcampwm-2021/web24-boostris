import './style.scss';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section__title--root">
      <span className="gt">&gt;</span>
      {children}
    </div>
  );
}

export default SectionTitle;
