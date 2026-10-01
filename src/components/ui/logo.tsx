import momentIcon from '@/assets/moment-icon.svg';
export function Logo({ size = 48 }: { size?: number }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#8057cb', fontWeight: 600, fontSize: size / 2, letterSpacing: '-.03em' }}><img src={momentIcon} alt="" width={size} height={size} /><span>Moment</span></span>;
}
