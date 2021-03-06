import { FC } from 'react';
import { Order, OrderData, Student } from '../constants/types';

type SummaryProps = {
  ordersData: OrderData[];
  notClaimedOrders: Order[];
  paidOrders: Order[];
  claimedOrders: Order[];
  classInfo: string;
  selectedStudents: Student[];
  classStudents: Student[];
};
const Summary: FC<SummaryProps> = ({
  ordersData = [],
  notClaimedOrders = [],
  paidOrders = [],
  claimedOrders = [],
  classInfo = '',
  selectedStudents = [],
  classStudents = [],
}) => {
  return (
    <div style={{ marginBottom: '10px' }}>
      {classInfo}({classStudents.length}人) [选中:{selectedStudents.length}人]
      {notClaimedOrders.length ? (
        <div>
          <strong>未被认领用户信息：</strong>
          {notClaimedOrders.map((order) => (
            <div key={order.user_id}>
              {order.user_id} {order.username}{' '}
              {order.flagid_name ? `[${order.flagid_name}]` : ''}
            </div>
          ))}
          <hr />
        </div>
      ) : null}
      {paidOrders.length > 0 ? (
        <span>
          &nbsp; [已购买: {paidOrders.length}人 /&nbsp;
          <strong>
            续费率：
            {ordersData.length &&
              Number((paidOrders.length / classStudents.length) * 100).toFixed(
                2
              )}{' '}
            %
          </strong>
          ] &nbsp; [已认领: {claimedOrders.length}人]
        </span>
      ) : null}
    </div>
  );
};

export default Summary;
