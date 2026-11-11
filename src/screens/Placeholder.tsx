/** Empty screen used until the real one is built. */
export default function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '32px 24px' }}>
      <h1 style={{ margin: 0, fontSize: 25 }}>{title}</h1>
      <p style={{ color: 'var(--color-placeholder)' }}>Coming soon.</p>
    </div>
  );
}
