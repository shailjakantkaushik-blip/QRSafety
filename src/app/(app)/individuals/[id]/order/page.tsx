import OrderPage from '../../order';

export default function IndividualOrderPage({ params }: { params: { id: string } }) {
  return <OrderPage individualId={params.id} />;
}
