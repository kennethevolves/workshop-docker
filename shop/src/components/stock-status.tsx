import { StatusDot } from '@/components/status-dot';

export function StockStatus({ stock }: { stock: number }) {
  if (stock === 0) {
    return <StatusDot active={false} label="Agotado" />;
  }
  return <StatusDot active label={stock < 5 ? `Últimas ${stock} piezas` : 'En existencia'} />;
}
