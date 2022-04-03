import React, { FC } from "react";
import { Order, OrderData } from "../constants/types";

type SummaryProps = {
  ordersData: OrderData[];
  notClaimedOrders: Order[];
  paidOrders: Order[];
  claimedOrders: Order[];
};
const Summary: FC<SummaryProps> = ({
  ordersData = [],
  notClaimedOrders = [],
  paidOrders = [],
  claimedOrders = [],
}) => {
  if (ordersData.length === 0) return null;

  return (
    <div style={{ marginBottom: "10px" }}>
      {notClaimedOrders.length ? (
        <div>
          <strong>未认领用户信息：</strong>
          {notClaimedOrders.map((order) => (
            <div>
              {order.user_id} {order.username}
            </div>
          ))}
          <hr />
        </div>
      ) : null}

      <div className="columns">
        <div>
          [已购买: {paidOrders.length}人 /&nbsp;
          <strong>
            续费率：
            {ordersData.length &&
              Number((paidOrders.length / ordersData.length) * 100).toFixed(
                2
              )}{" "}
            %
          </strong>
          ] &nbsp; [已认领: {claimedOrders.length}人]
        </div>
      </div>
    </div>
  );
};

export default Summary;
