import React, { useMemo, useState } from "react";
import "./App.css";
import QueryForm from "./components/QueryForm";
import Results from "./components/Results";
import { FormData, Order, OrderData, ValidOrderData } from "./constants/types";
import { linesStrToArr } from "./helpers";
import { claimOrders, getOrdersData, testHasAccess } from "./helpers/requests";

function App() {
  const [ordersData, setOrdersData] = useState([] as OrderData[]);

  const paidOrdersData = useMemo(
    () => ordersData.filter((data) => !!data) as ValidOrderData[],
    [ordersData]
  );

  const paidOrders: Order[] = useMemo(
    () => paidOrdersData.map((data) => data.order),
    [paidOrdersData]
  );

  const claimedOrders: Order[] = useMemo(
    () =>
      paidOrdersData.filter((data) => data.claimed).map((data) => data.order),
    [paidOrdersData]
  );

  const notClaimedOrders: Order[] = useMemo(() => {
    const orders = [];
    const claimedIds = claimedOrders.map((order) => order.user_id);
    const claimedIdSet = new Set(claimedIds);

    for (let paid of paidOrders) {
      if (!claimedIdSet.has(paid.user_id)) {
        orders.push(paid);
      }
    }
    return orders;
  }, [claimedOrders, paidOrders]);

  const queryOrderHandler = async (formData: FormData) => {
    const hasAccess = await testHasAccess(formData.token, formData.ids[0]);

    if (hasAccess) {
      setOrdersData([]);

      const ordersData = await getOrdersData(
        formData.token,
        linesStrToArr(formData.ids),
        formData.workName,
        formData.owner
      );
      setOrdersData(ordersData);
    }
  };

  const claimOrderHandler = async (formData: FormData) => {
    if (!ordersData.length) {
      await queryOrderHandler(formData);
    }

    if (notClaimedOrders.length) {
      await claimOrders(formData.token, formData.classInfo, notClaimedOrders);
      await queryOrderHandler(formData);
      alert("已重新获取数据，也可以去系统查看验证");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="tip">
          <p>
            若要<em>查询</em>，请确保用户ID、项目链接名称、归属人准确
          </p>
          <p>
            若要<em>自动领单</em>，除了确保用户ID、项目链接名称、归属人准确，
            <br />
            <strong>重点注意token和课程名</strong>，因为
            <strong>会决定归属人和所属班期</strong>
            <br />
            <strong>token需要更新为认领人的token</strong>
          </p>
        </div>
      </header>
      <QueryForm
        onQueryOrder={queryOrderHandler}
        onClaimOrder={claimOrderHandler}
      />
      <Results
        ordersData={ordersData}
        notClaimedOrders={notClaimedOrders}
        claimedOrders={claimedOrders}
        paidOrders={paidOrders}
      />
    </div>
  );
}

export default App;
