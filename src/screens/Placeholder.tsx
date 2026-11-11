import SubHeader from '../components/SubHeader';

/** Empty screen used until the real one is built. `back` = sub-screen with the back arrow. */
export default function Placeholder({ title, back = false }: { title: string; back?: boolean }) {
  if (back) {
    return (
      <div className="sub-screen">
        <SubHeader title={title} />
        <p style={{ color: 'var(--color-placeholder)' }}>Coming soon.</p>
      </div>
    );
  }
  return (
    <div style={{ padding: '32px 24px' }}>
      <h1 style={{ margin: 0, fontSize: 25 }}>{title}</h1>
      <p style={{ color: 'var(--color-placeholder)' }}>Coming soon.</p>
    </div>
  );
}
