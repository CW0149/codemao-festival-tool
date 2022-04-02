import React, { FC } from "react";
import { Order, OrderData } from "../constants/types";

type ResultsProps = {
  ordersData: OrderData[];
  notClaimedOrders: Order[];
  paidOrders: Order[];
  claimedOrders: Order[];
};
const Results: FC<ResultsProps> = ({
  ordersData = [],
  notClaimedOrders = [],
  paidOrders = [],
  claimedOrders = [],
}) => {
  if (ordersData.length === 0) return null;

  const columnPaidStatus = ordersData.map((item) => (item ? "是" : "-"));
  const columnClaimedStatus = ordersData.map((item) =>
    item && item.claimed ? "是" : "-"
  );

  return (
    <div>
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
          <div>
            已购买人数是: {paidOrders.length} /&nbsp;
            <strong>
              续费率：
              {ordersData.length &&
                Number((paidOrders.length / ordersData.length) * 100).toFixed(
                  2
                )}{" "}
              %
            </strong>
          </div>
          <div>
            已购买用户ID为：{paidOrders.map((user) => user.user_id).join(", ")}
          </div>
          <div>
            已购买用户昵称为：
            {paidOrders.map((user) => user.username).join(", ")}
          </div>
          <div>
            <strong>-------请复制下面标记到表格新的一列-------</strong>
          </div>
          {columnPaidStatus.map((status) => (
            <div>{status}</div>
          ))}
        </div>
        <div>
          <div>已认领人数是: {claimedOrders.length}</div>
          <div>
            {" "}
            已认领用户ID为：
            {claimedOrders.map((order) => order.user_id).join(", ")}
          </div>
          <div>
            已认领用户昵称为：
            {claimedOrders.map((order) => order.username).join(", ")}
          </div>

          <div>
            <strong>-------请复制下面标记到表格新的一列-------</strong>
          </div>
          {columnClaimedStatus.map((status) => (
            <div>{status}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
