import { FC, useEffect } from 'react';
import { ProfileOrdersUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import {
  getOrders,
  selectOrders,
  selectOrdersLoading
} from '../../services/slices/orders';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();

  const orders = useSelector(selectOrders);
  const isLoading = useSelector(selectOrdersLoading);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  if (isLoading) {
    return <p className='text text_type_main-medium'>Загрузка...</p>;
  }

  return <ProfileOrdersUI orders={orders} />;
};
