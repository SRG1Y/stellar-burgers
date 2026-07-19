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

  console.log('BurgerConstructor render');
  console.log('Constructor:', constructorItems);
  console.log('User:', user);
  console.log('Order state:', orderState);

  const orderModalData = orderState.order;
  const orderRequest = orderState.isLoading;
  const isBunSelected = !!constructorItems.bun;

  const onOrderClick = () => {
    console.log('========== ORDER CLICK ==========');
    console.log('USER:', user);
    console.log('BUN:', constructorItems.bun);
    console.log('INGREDIENTS:', constructorItems.ingredients);

    if (!user) {
      console.log('❌ USER IS NULL');
      navigate('/login');
      return;
    }

    if (!constructorItems.bun) {
      console.log('❌ NO BUN');
      return;
    }

    const ingredientsIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id
    ];

    console.log('✅ DISPATCH createOrder');
    console.log('Ingredients IDs:', ingredientsIds);

    dispatch(createOrder(ingredientsIds));
  };

  const closeOrderModal = () => {
    console.log('Closing order modal');
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
