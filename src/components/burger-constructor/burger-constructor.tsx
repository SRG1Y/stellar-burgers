import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { selectConstructor } from '../../services/slices/constructorSlice';
import {
  createOrder,
  selectOrder,
  clearOrder
} from '../../services/slices/order';
import { selectUser } from '../../services/slices/userSlice';
import { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector(selectConstructor);
  const user = useSelector(selectUser);
  const orderState = useSelector(selectOrder);

  const orderModalData = orderState.order;
  const orderRequest = orderState.isLoading;
  const isBunSelected = !!constructorItems.bun;

  const onOrderClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!constructorItems.bun) {
      return;
    }

    const ingredientsIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    dispatch(createOrder(ingredientsIds));
  };

  const closeOrderModal = () => {
    dispatch(clearOrder());
  };

  const price = useMemo(() => {
    let total = 0;

    if (constructorItems.bun) {
      total += constructorItems.bun.price * 2;
    }

    total += constructorItems.ingredients.reduce(
      (sum: number, item: TConstructorIngredient) => sum + item.price,
      0
    );

    return total;
  }, [constructorItems]);

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
      isBunSelected={isBunSelected}
    />
  );
};
