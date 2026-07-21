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

  console.log('========== RENDER ==========');
  console.log('USER:', user);
  console.log('ORDER STATE:', orderState);
  console.log('============================');

  const orderModalData = orderState.order;
  const orderRequest = orderState.isLoading;
  const isBunSelected = !!constructorItems.bun;

  const onOrderClick = async () => {
    console.log('USER:', user);

    if (!user) {
      console.log('NO USER');
      navigate('/login');
      return;
    }

    if (!constructorItems.bun) {
      console.log('NO BUN');
      return;
    }

    const ingredientsIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    try {
      const action = await dispatch(createOrder(ingredientsIds));

      console.log('ACTION TYPE:', action.type);
      console.log('ACTION:', action);

      if (createOrder.fulfilled.match(action)) {
        console.log('ORDER SUCCESS');
      }

      if (createOrder.rejected.match(action)) {
        console.log('ORDER FAILED');
        console.log('ERROR:', action.error);
        console.log('PAYLOAD:', action.payload);
      }
    } catch (e) {
      console.error('DISPATCH ERROR:', e);
    }
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
