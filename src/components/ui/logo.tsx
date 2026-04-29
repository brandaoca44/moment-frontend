export function Logo({ size = 48 }: { size?: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: 800,
        fontSize: size / 2,
        color: '#7c3aed',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: size / 2,
          fontWeight: 900,
          boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)',
        }}
      >
        M
      </div>

      <span>Moment</span>
    </div>
  )
}